const express = require("express");
const User = require('../models/User');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'userspicture/' });
const fs = require('fs');
const Team = require('../models/Team');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Rank= require('../models/Rank');

// GET all users
router.get('/', async (req, res) => {
    try {
      const users = await User.find().populate('rank');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.post('/check-daily-cash', async (req, res) => {
    try {
      const userId = req.user.id; // Assume user ID is in req.user from auth middleware
      const user = await User.findById(userId).populate('rank'); // Populate rank to get rank details
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const today = new Date().toISOString().split('T')[0];
      let lastCashCollectionDateDay= user.lastCashCollectionDate;
      if(lastCashCollectionDateDay){
        lastCashCollectionDateDay= user.lastCashCollectionDate.toISOString().split('T')[0];
      }
  
      // Always perform rank check
      const ranks = await Rank.find().sort({ dailyCash: 1 }); // Sort ranks by dailyCash ascending
      const userRankIndex = ranks.findIndex(rank => rank._id.toString() === user.rank._id.toString());
      
      let newRank = user.rank; // Default to current rank
  
      // Determine next rank
      if (user.coins >= user.rank.coinsNeedToRankUp) {
        newRank = ranks[userRankIndex+1];
      }
      
  
      let rankUpdated = false;
      if (newRank._id.toString() !== user.rank._id.toString()) {
        user.rank = newRank; // Update user rank
        user.dailyCashCollect=newRank.dailyCash;
        rankUpdated = true;
      }
  
      // Handle daily cash collection
      if (lastCashCollectionDateDay !== today) {
        user.lastCashCollectionDate = today;
        const dailyCash = user.dailyCashCollect;
  
        if (dailyCash > 0) {
          // Add daily cash to user’s cash
          user.cash += dailyCash;
  
          // Save user updates
          await user.save();
          return res.json({ showPopup: true, message: rankUpdated ? `${newRank.name}` : '', cash: dailyCash, rankUpdated });
        } else {
          // No cash collected, just update the rank if necessary
          await user.save();
          return res.json({ showPopup: rankUpdated, message: rankUpdated ? `${newRank.name}` : '', cash: 0 });
        }
      } else {
        // No new cash collection but may have updated rank
        await user.save();
        return res.json({ showPopup: rankUpdated, message: rankUpdated ? `${newRank.name}` : '', cash: 0 });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  

  

  //get user profile
  router.get('/profile', async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('rank').populate('favTeam').select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // UPDATE user profile
router.put('/profile', uploadMiddleware.single('file'), async (req, res) => {
  const { username, email, favTeam } = req.body;

  // Handle profile picture upload
  let newPath = null;
  if (req.file) {
      const { originalname, path: tempPath } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = `${tempPath}.${ext}`;
      fs.renameSync(tempPath, newPath);
  }

  try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update username if provided
      if (username) {
          if (username.length < 3) {
              return res.status(400).json({ message: 'Username must be at least 3 characters long' });
          }
          user.username = username;
      }

      // Update email if provided
      if (email) {
          // Validate email format (simple validation)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              return res.status(400).json({ message: 'Invalid email format' });
          }
          user.email = email;
      }

     
      if (favTeam) {
          const teamExists = await Team.findById(favTeam);
        
          if (!teamExists) return res.status(400).json({ message: 'Favorite team not found' });
          user.favTeam = teamExists.id;
      }

 
      // Update profile picture if uploaded
      if (newPath) {
          user.profilePicture = newPath;
      }

      const updatedUser = await user.save();
      const finalUser = await User.findById(updatedUser.id).populate('rank').populate('favTeam').select('-password');
      res.json(finalUser);
  } catch (err) {
      if (err.code === 11000) { // Duplicate key error (e.g., unique email constraint)
          return res.status(400).json({ message: 'Email already exists' });
      }
      res.status(500).json({ message: err.message });
  }
});

router.post(
  '/resetpassword',
  [
    // Validate the input fields
    body('oldPassword', 'Old password is required').not().isEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    body('confirmNewPassword', 'Confirm new password is required').not().isEmpty(),
    body('confirmNewPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('New passwords do not match')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    try {
      // Find the user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if the old password is correct
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Old password is incorrect' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      // Save the user with the new password
      await user.save();

      res.status(200).json({ msg: 'Password reset successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;