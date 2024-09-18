// controllers/betController.js
const Bet = require('../models/UserBets');
const Match = require('../models/Bet');
const express = require("express");
const User = require('../models/User');
const auth = require('../middleware/auth');
const GamesPlayed = require('../models/GamesPlayed');

const router = express.Router();

router.get('/user-bets', auth, async (req, res) => {
 

    const userId = req.user.id;

    try {
      const userBets = await Bet.find({ user:userId })
   
      res.json(userBets);
    } catch (err) {
  
      res.status(500).send('Server error');
    }
  });

  router.get('/user-finish-bets', auth, async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Fetch all bets for the current user
      const userBets = await Bet.find({ user: userId })
        .populate({
          path: 'matchId',
          populate: {
            path: 'hometeam awayteam',
            select: 'name imageUrl',
          },
        });
  
      // Filter the bets to include only those with finished matches
      const finishedBets = userBets.filter(bet => bet.matchId && bet.matchId.status === 'finished');
  
      // Fetch game details from GamesPlayed where matchId matches
      const matchIds = finishedBets.map(bet => bet.matchId._id);
      const gamesPlayed = await GamesPlayed.find({ matchId: { $in: matchIds } })
        .populate({
          path: 'hometeam awayteam',
          select: 'name imageUrl',
        });
  
      // Combine bet and game data
      const combinedResults = finishedBets.map(bet => {
        const gameDetails = gamesPlayed.find(game => game.matchId.equals(bet.matchId._id));
        return {
          ...bet.toObject(),
          game: gameDetails || null,
        };
      });
  
      res.json(combinedResults);
    } catch (err) {
      res.status(500).send('Server error');
    }
  });

    // Utility to get the date 24 hours ago
    const getDate24HoursAgo = () => {
      return new Date(new Date() - 24 * 60 * 60 * 1000);
    };

  //get user bets , included matches
  router.get('/user-bets-with-matches', auth, async (req, res) => {
 

    const userId = req.user.id;
  
    try {
      const twentyFourHoursAgo = getDate24HoursAgo();

      const userBets = await Bet.find({ user: userId })
            .populate({
                path: 'matchId',
                match: {
                    $or: [
                        { "status": { $ne: "finished" } }, // Match status not finished
                        { 
                            "status": "finished", 
                            "datetime": { $gte: twentyFourHoursAgo } // Match datetime within the last 24 hours
                        }
                    ]
                },
                populate: {
                    path: 'hometeam awayteam',
                    select: 'name imageUrl'
                }
            });

        // Filter out bets that don't have a populated match due to the match conditions
        const filteredBets = userBets.filter(bet => bet.matchId !== null);

        res.json(filteredBets);
    } catch (err) {
     
      res.status(500).send('Server error');
    }
  });

router.delete('/delete-bet/:id',auth,async(req,res)=>{
  const userId = req.user.id;
  const matchId  = req.params.id ;

  // Fetch the user
  const user = await User.findById(userId);
  // Check if the user  placed a bet on this match

  let existingBet = await Bet.findOne({ user:userId, matchId:matchId });

  if(existingBet){
    //delete bet
      await Bet.deleteOne({ user: userId, matchId });
          
      // Refund the bet amount to the user's cash
      user.cash += existingBet.betCash;
      await user.save();

      return res.json({ msg: 'Bet removed successfully.' });
  }else{
    return res.status(400).json({ msg: 'User bet not found' });
  }
})

// Save bet and check user's cash
router.post('/place-bet', auth, async (req, res) => {
    const userId = req.user.id;
    const { matchId, option, betAmount } = req.body;
  
    try {
      // Fetch the user
      const user = await User.findById(userId);
  
      // Fetch the match and verify it's upcoming
      const match = await Match.findById(matchId);
      if (!match || match.status !== 'upcoming') {
        return res.status(400).json({ msg: 'This match is not available for betting.' });
      }
  
      let  betWinCash=0;
      
      switch(option) {
        case '1':  
            betWinCash = betAmount * match.bet1;
            break;
        case 'X': 
            betWinCash = betAmount * match.betx;
            break;
        case '2':  
            betWinCash = betAmount * match.bet2;
            break;
        default:
            betWinCash = betAmount;
        }
      // Check if the user already placed a bet on this match
      let existingBet = await Bet.findOne({ user:userId, matchId });
  
      if (existingBet) {
       
        // Update existing bet
        const cashDifference = betAmount - existingBet.betCash;
      
        // Ensure the user has enough cash for the difference in the updated bet
        if (user.cash < cashDifference) {
          return res.status(400).json({ msg: 'Not enough cash to modify this bet.' });
        }
       
        existingBet.betOption = option;
        existingBet.betCash = betAmount;
        existingBet.winCash = betWinCash;
        await existingBet.save();

        // Deduct/add the difference in cash
        user.cash -= cashDifference;
    
      } else {
          // Check if the user has enough cash
        if (user.cash < betAmount) {
          return res.status(400).json({ msg: 'Not enough cash to place this bet.' });
        }
        // Create a new bet
        const newBet = new Bet({
          user:userId,
          matchId,
          betOption:option,
          betCash:betAmount,
          winCash:betWinCash
        });
        await newBet.save();
  
        // Deduct the bet amount from the user's cash
        user.cash -= betAmount;
      }
  
      // Save the user's updated cash balance
      await user.save();
      
      res.json({ msg: 'Bet placed successfully.' });
    } catch (err) {

      res.status(500).send('Server error');
    }
  });

//get last 5 bets status of user
router.get('/recent/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from the path parameters

  try {
    // Fetch the last 5 user bets for the specified user where status is 'ended'
    const userBets = await Bet.find({ user: userId, status: 'ended' })
      .sort({ date: -1 }) // Sort by date in descending order
      .limit(5); // Limit the results to 5

    // Process the bets to create the result list
    const result = userBets.map(bet => bet.winCash > 0 ? 'W' : 'L');

    // Send the result as the response
    res.json(result);
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;