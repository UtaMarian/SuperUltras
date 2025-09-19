const express = require('express');
const Rank = require('../models/Rank'); // Assuming Rank model is defined in models/Rank.js
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Setup multer for file uploads
const uploadMiddleware = multer({ dest: 'rankicons/' });

// GET all ranks
router.get('/', async (req, res) => {
  try {
    const ranks = await Rank.find({});
    res.json(ranks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a new rank
router.post('/', uploadMiddleware.single('file'), async (req, res) => {
  const { name, dailyCash, coinsNeedToRankUp } = req.body;
  let iconUrl = '';

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = `${path}.${ext}`;
    fs.renameSync(path, newPath);
    iconUrl = `${newPath}`;
  }

  try {
    const newRank = new Rank({
      name,
      icon: iconUrl,
      dailyCash,
      coinsNeedToRankUp,
    });

    await newRank.save();
    res.status(201).json(newRank);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE an existing rank
router.put('/:id', uploadMiddleware.single('file'), async (req, res) => {
  const { id } = req.params;
  const { name, dailyCash, coinsNeedToRankUp } = req.body;
  let iconUrl = '';

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = `${path}.${ext}`;
    fs.renameSync(path, newPath);
    iconUrl = `${process.env.REACT_APP_API}/rankicons/${newPath}`;
  }

  try {
    const updatedRank = await Rank.findByIdAndUpdate(
      id,
      {
        name,
        icon: iconUrl || undefined, // Only update icon if a new file is uploaded
        dailyCash,
        coinsNeedToRankUp,
      },
      { new: true }
    );

    if (!updatedRank) {
      return res.status(404).json({ message: 'Rank not found' });
    }

    res.json(updatedRank);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a rank
router.delete('/:id', async (req, res) => {
  try {
    
    const rank = await Rank.findById(req.params.id);
    if (!rank) {
      return res.status(404).json({ message: 'Rank not found' });
    }

    // Remove rank icon file if exists
    if (rank.icon) {
      const filePath = rank.icon.replace(`${process.env.REACT_APP_API}/`, '');
      console.log(filePath);
      fs.unlinkSync(filePath);
    }
console.log(rank);
    const status=await Rank.deleteOne({_id:req.params.id});
    console.log(status);
    res.json({ message: 'Rank deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//get a rank image by name
router.get('/rank-image/:name', async (req, res) => {
  try {
    const rankName = req.params.name;

    // Find the rank by its name
    const rank = await Rank.findOne({ name: rankName });
    
    if (!rank) {
      return res.status(404).json({ message: 'Rank not found' });
    }

    // Respond with the rank image URL
    return res.json({ imageUrl: rank.icon });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
