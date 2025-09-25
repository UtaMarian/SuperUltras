
const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const Rank =require("../models/Rank");
const Player = require('../models/Player');
// JWT Secret Key
const JWT_SECRET = 'yoursecretkey';

router.post(
  '/register',
  [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('favoriteTeam', 'Favorite team is required').not().isEmpty(),
    check('position', 'Position is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, favoriteTeam, position } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const rank = await Rank.findOne({ name: "Common" });

      // Check if the favorite team exists
      const teamExists = await Team.findById(favoriteTeam);
      if (!teamExists) {
        return res.status(400).json({ msg: 'Favorite team not found' });
      }

      user = new User({
        username,
        email,
        password,
        rank: rank._id,
        dailyCashCollect: rank.dailyCash,
        favTeam: teamExists.id,
      });

      await user.save();

      // 🔥 Creează playerul cu poziția aleasă de user
      const player = new Player({
        name: username,
        goals: 0,
        level: 1,
        influence: "0",
        position: position, // venit din frontend
        icon: "userspicture/default.png",
        team: teamExists._id,
        user:user._id
      });

      await player.save();

      user.player = player._id;
      await user.save();

      const payload = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          cash: user.cash,
          coins: user.coins,
          rank: rank,
          favoriteTeam: teamExists.name,
          role: user.role,
          playerId: player._id,
          position: player.position,
        }
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

  router.post(
    '/login',
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').exists()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        let user = await User.findOne({ email }).populate('rank','name').populate('player','trainingPoints level');
  
        if (!user) {
          return res.status(400).json({ msg: 'Invalid Credentials' });
        }
  
        const isMatch = await user.matchPassword(password);
  
        if (!isMatch) {
          return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        
        user.lastLogin=Date.now();
        await user.save();
        const payload = {
            user: {
              id: user.id,
              username:user.username,
              email:user.email,
              cash:user.cash,
              coins:user.coins,
              rank:user.rank.name,
              favoriteTeam:user.favTeam,
              role:user.role,
              trainingPoints:user.player.trainingPoints,
              level:user.player.level,
              tutorialCompleted: user.tutorialCompleted
            }
          };
  
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
          if (err) throw err;
          res.json({ token });
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );

  // Protected route
router.get('/', authMiddleware, async (req, res) => {
    // req.user is available here due to the middleware

    res.json({ msg: 'This is a protected route', user: req.user });
  });
module.exports = router;