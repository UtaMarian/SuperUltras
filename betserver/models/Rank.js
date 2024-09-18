const mongoose = require('mongoose');

// Define the Rank schema
const RankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String, // URL to the icon image
    required: true
  },
  dailyCash: {
    type: Number,
    required: true
  },
  coinsNeedToRankUp: {
    type: Number,
    required: true
  },
  noOfPlayers: {
    type: Number,
    default: 0
  }
});

// Export the Rank model
module.exports = mongoose.model('Rank', RankSchema);
