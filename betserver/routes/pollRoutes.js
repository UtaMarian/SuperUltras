const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const authMiddleware = require('../middleware/auth'); // middleware to get user from token
const User = require('../models/User');
const TeamModel = require('../models/Team');

// Create a poll
router.post('/vote-manager', async (req, res) => {
  try {
    const { clubId, managerId } = req.body;
    if (!clubId || !managerId) {
      return res.status(400).json({ msg: 'Missing fields' });
    }

    // 🔍 Check if there is already an active poll for this club
    const existingPoll = await Poll.findOne({ club: clubId, isActive: true });
    if (existingPoll) {
      return res.status(400).json({ msg: 'There is already a live poll for this club.' });
    }

    // ✅ Create new poll
    const poll = new Poll({
      club: clubId,
      manager: managerId,
      creator: req.user.id,
      votesYes: [],
      votesNo: [],
      endAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    await poll.save();
    res.status(201).json({ poll });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create a poll
router.post('/change-manager', async (req, res) => {
  try {
    const { clubId, managerId } = req.body;
    if (!clubId || !managerId) {
      return res.status(400).json({ msg: 'Missing fields' });
    }

    const club =await TeamModel.findById(clubId);
    if(!club){
      return res.status(404).json({ msg: 'Club not found' });
    }
    club.manager=managerId;
    await club.save();


    res.status(200).json({ msg: 'Manager changed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get polls for a club
router.get('/myclub', async (req, res) => {
  try {
    const polls = await Poll.findOne({ 
    club: req.user.favoriteTeam, 
    isActive: true 
  })
      .populate('manager', 'username profilePicture')
      .populate('creator', 'username profilePicture')
      .lean();
    res.json({ polls });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Vote in a poll
router.post('/:pollId/vote', async (req, res) => {
  try {
    const { vote } = req.body; // vote = 'yes' or 'no'
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    // Prevent double voting
    if (poll.votesYes.includes(req.user.id) || poll.votesNo.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You have already voted' });
    }

    if (vote === 'yes') {
      poll.votesYes.push(req.user.id);
    } else if (vote === 'no') {
      poll.votesNo.push(req.user.id);
    } else {
      return res.status(400).json({ msg: 'Invalid vote' });
    }

    await poll.save();
    res.json({ msg: 'Vote counted', poll });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// GET all users from a team
router.get("/getusers", async (req, res) => {
  try {
    const userId = req.user.id;
  
    const users = await User.find({ favTeam: req.user.favoriteTeam });
    // returnează array chiar dacă e gol
    res.json(users); // chiar dacă nu există jucători, trimite []
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:pollid/has-voted/', async (req, res) => {
  try {
    const userId = req.user.id;
    const poll = await Poll.findById(req.params.pollid);
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }
    const hasVoted =
      poll.votesYes.some((id) => id.toString() === userId) ||
      poll.votesNo.some((id) => id.toString() === userId);

    res.json({ hasVoted });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
module.exports = router;
