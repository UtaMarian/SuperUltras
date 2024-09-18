// routes/betRoutes.js

const express = require('express');
const Bet = require('../models/Bet');

const router = express.Router();

// CREATE a new bet
router.post('/', async (req, res) => {
    try {
        
        const { hometeam, awayteam, bet1, betx, bet2, datetime } = req.body.bet;

        const newBet = new Bet({
            hometeam,
            awayteam,
            bet1,
            betx,
            bet2,
            datetime: new Date(datetime), 
            status:'upcoming'
        });

        const savedBet = await newBet.save();
        res.status(201).json(savedBet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// READ all bets
router.get('/', async (req, res) => {
    try {
        const bets = await Bet.find().populate('hometeam awayteam', 'name'); // Populate team names
        res.json(bets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//get top 3
router.get('/top3/', async (req, res) => {
  try {
    // Define the current date and time
    const now = new Date();
    
    // Find bets where the date is in the future, sort by date, and limit to 3 results
    const bets = await Bet.find({ datetime: { $gt: now } }) // Filter future bets
      .populate('hometeam awayteam', 'name') // Populate team names
      .sort({ datetime: 1 }) // Sort by date in ascending order
      .limit(3); // Limit to the next 3 bets

    res.json(bets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ a specific bet by ID
router.get('/:id', async (req, res) => {
    try {
        const bet = await Bet.findById(req.params.id).populate('hometeam awayteam', 'name');
        if (!bet) return res.status(404).json({ message: 'Bet not found' });
        res.json(bet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// UPDATE a specific bet by ID
router.put('/:id', async (req, res) => {
    try {
        const { hometeam, awayteam, bet1, betx, bet2, datetime } = req.body;
        const updatedBet = await Bet.findByIdAndUpdate(
            req.params.id,
            {
                hometeam,
                awayteam,
                bet1,
                betx,
                bet2,
                datetime: new Date(datetime),
            },
            { new: true }
        ).populate('hometeam awayteam', 'name');

        if (!updatedBet) return res.status(404).json({ message: 'Bet not found' });

        res.json(updatedBet);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a specific bet by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedBet = await Bet.findByIdAndDelete(req.params.id);
        if (!deletedBet) return res.status(404).json({ message: 'Bet not found' });

        res.json({ message: 'Bet deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Helper function to get start and end of the day
const getStartAndEndOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
  
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
  
    return { start, end };
  };
  
  // Helper function to get the appropriate date range
  const getDateRange = (option) => {
    const today = new Date();
    let start, end;
  
    switch (option.toLowerCase()) {
      case 'today':
        ({ start, end } = getStartAndEndOfDay(today));
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        ({ start, end } = getStartAndEndOfDay(tomorrow));
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        ({ start, end } = getStartAndEndOfDay(yesterday));
        break;
      default:
        throw new Error('Invalid date option');
    }
  
    return { start, end };
  };
  
  // Route to get bets based on date range
  router.get('/date/:option', async (req, res) => {
    try {
      const { option } = req.params;
      const { start, end } = getDateRange(option);
  
      const bets = await Bet.find({
        datetime: {
          $gte: start,
          $lte: end,
        },
      }).populate('hometeam awayteam', 'name imageUrl')
      .sort({ datetime: 1 });
  
      res.json(bets);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });



  
module.exports = router;
