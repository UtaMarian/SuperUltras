const Match = require('../models/Bet');
const cron = require('node-cron');
const GamesPlayed = require('../models/GamesPlayed');

const updateMatchStatus = async () => {
    try {
      const matches = await Match.find({ status: { $in: ['upcoming', 'in_progress'] } });
      const currentTime = new Date();
  
      

      matches.forEach(async (match) => {

        if (match.status === 'upcoming' && match.datetime <= currentTime) {
          match.status = 'in_progress';
          console.log('Match with id '+match._id+' update status to : '+ match.status);
        }
        // Assuming matches last 90 minutes, you can adjust this logic as needed
        const matchEndTime = new Date(match.datetime);
        matchEndTime.setMinutes(matchEndTime.getMinutes() + 105);
  
        if (match.status === 'in_progress' && matchEndTime <= currentTime) {
          match.status = 'finished';

          //Update Games Played
          const gamePlayed = new GamesPlayed({
            hometeam:match.hometeam,
            awayteam:match.awayteam,
            matchId:match._id,
            status:'unset'
          });
          await gamePlayed.save();
          console.log('Match with id '+match._id+' update status to : '+ match.status);
        }
        
     
        await match.save();
        
      });
      

      
    } catch (err) {
      console.error('Error updating match statuses:', err);
    }
  };
  
  // Schedule the function to run every minute
cron.schedule('* * * * *', () => {
  //console.log('Running match status update check...');
  //updateMatchStatus();
});

  module.exports = updateMatchStatus;