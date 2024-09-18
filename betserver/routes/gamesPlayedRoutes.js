
const express = require('express');
const GamesPlayed = require('../models/GamesPlayed');
const UserBets=require('../models/UserBets');
const router = express.Router();
const User=require('../models/User');

// READ all games played that it s unset
router.get('/', async (req, res) => {
  try {
      const threeHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000); // Get the date 3 hours ago

      const games = await GamesPlayed.find({
          $or: [
              { status: 'unset' }, // Matches with status unset
              { 
                  status: 'set',
                  createdAt: { $gte: threeHoursAgo } // Matches with status 'set' updated in the last 3 hours
              }
          ]
      }).populate('hometeam awayteam', 'name'); // Populate team names

      res.json(games);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
    const { homeScore, awayScore } = req.body;
  
    try {
      const match = await GamesPlayed.findById(req.params.id);
      
      if (!match) return res.status(404).json({ message: 'Match not found' });
  
      if (homeScore<0 || awayScore<0) {
        return res.status(400).json({ message: 'Score must be positive' });
      }
  
      match.homeScore=homeScore;
      match.awayScore=awayScore;
      match.status="set";

      const updateMatch = await match.save();
      
      //Update users bets 
      //--

      const userBets = await UserBets.find({matchId: updateMatch.matchId});
     
      userBets.forEach(bet => {
        if((bet.betOption==="X" && homeScore==awayScore) || (bet.betOption==="1" && homeScore>awayScore) || (bet.betOption==="2" && homeScore<awayScore)){
            bet.status="colect";
        }else{
            bet.winCash=0;
            bet.status="ended";
        }
        bet.save();
      });
    

      res.json(updateMatch);

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  router.post('/colectcash/:id', async (req, res) => {

    
    const userBetMatch = await UserBets.findById(req.params.id);

    const userId = req.user.id;
 
    if(userBetMatch.status==='colect'){
      const userProfile= await User.findById(req.user.id);
      userProfile.cash+=userBetMatch.winCash;
      userProfile.coins+=1;
      userBetMatch.status="ended";
      await userBetMatch.save();
      await userProfile.save();
      return res.status(200).json({ message: 'Cash was colected' });
    }
    else{
      return res.status(400).json({ message: 'Cash can not be colected' });
    }
  })
module.exports = router;