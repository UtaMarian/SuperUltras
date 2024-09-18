const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
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
  bet1: {
    type: Number,
    required: true,
    min: 1.0 // Assuming a minimum betting value; adjust as needed
  },
  betx: {
    type: Number,
    required: true,
    min: 1.0 // Assuming a minimum betting value; adjust as needed
  },
  bet2: {
    type: Number,
    required: true,
    min: 1.0 // Assuming a minimum betting value; adjust as needed
  },
  datetime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['upcoming', 'in_progress', 'finished'], // Match statuses
    default: 'upcoming'
  },
  // odds: {
  //   homeWin: { type: Number, required: true },
  //   draw: { type: Number, required: true },
  //   awayWin: { type: Number, required: true }
  // }
});

const Bet = mongoose.model('Bet', BetSchema);

module.exports = Bet;