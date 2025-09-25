const Match = require('../models/Match');
const cron = require('node-cron');
const GamesPlayed = require('../models/GamesPlayed');

const updateMatchStatus = async () => {
    // try {
    //   const matches = await Match.find({ status: { $in: ['upcoming', 'in_progress'] } });
    //   const currentTime = new Date();
  
      

    //   matches.forEach(async (match) => {

    //     if (match.status === 'upcoming' && match.datetime <= currentTime) {
    //       match.status = 'in_progress';
    //       console.log('Match with id '+match._id+' update status to : '+ match.status);
    //     }
    //     // Assuming matches last 90 minutes, you can adjust this logic as needed
    //     const matchEndTime = new Date(match.datetime);
    //     matchEndTime.setMinutes(matchEndTime.getMinutes() + 105);
  
    //     if (match.status === 'in_progress' && matchEndTime <= currentTime) {
    //       match.status = 'finished';

    //       //Update Games Played
    //       const gamePlayed = new GamesPlayed({
    //         hometeam:match.hometeam,
    //         awayteam:match.awayteam,
    //         matchId:match._id,
    //         status:'unset'
    //       });
    //       await gamePlayed.save();
    //       console.log('Match with id '+match._id+' update status to : '+ match.status);
    //     }
        
     
    //     await match.save();
        
    //   });
      

      
    // } catch (err) {
    //   console.error('Error updating match statuses:', err);
    // }

    try {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  

    const result = await Match.updateMany(
      { date: { $gte: now, $lte: next24h } },
      { $set: { status: "scheduled", played: false } }
    );

   console.log(result);
  } catch (err) {
    console.error(err);
   
  }
  };
  
  // Schedule the function to run every minute
cron.schedule('* * * * *', () => {
  //console.log('Running match status update check...');
  //updateMatchStatus();
});


async function updateMatchesMinus15Days() {
  try {
    // 15 days in milliseconds
    const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;

    // Find all matches
    const matches = await Match.find();

    // Update each match date
    const bulkOps = matches.map((match) => ({
      updateOne: {
        filter: { _id: match._id },
        update: { date: new Date(match.date.getTime() - fifteenDaysMs) },
      },
    }));

    if (bulkOps.length > 0) {
      const result = await Match.bulkWrite(bulkOps);
      console.log(`Updated ${result.modifiedCount} matches.`);
    } else {
      console.log("No matches found to update.");
    }
  } catch (err) {
    console.error("Error updating matches:", err);
  }
}

  module.exports = {updateMatchStatus,updateMatchesMinus15Days};