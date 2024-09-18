const mongoose = require('mongoose');

const GamesPlayedSchema = new mongoose.Schema({
  hometeam: {
    type: mongoose.Schema.Types.ObjectId, // Assuming hometeam and awayteam are references to a Team collection
    ref: 'Team',
    required: true
  },
  awayteam: {
    type: mongoose.Schema.Types.ObjectId, // Assuming hometeam and awayteam are references to a Team collection
    ref: 'Team',
    required: true
  },
  matchId:{
    type: mongoose.Schema.Types.ObjectId, // Assuming hometeam and awayteam are references to a Team collection
    ref: 'Bet',
    required: true
  },
  homeScore:{
    type:Number,
    default:0
  },
  awayScore:{
    type:Number,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['set', 'unset', 'live'], // Match statuses
    default: 'unset'
  },
});

const GamesPlayed = mongoose.model('GamesPlayed', GamesPlayedSchema);

module.exports = GamesPlayed;