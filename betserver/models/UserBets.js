// models/UserBet.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create UserBet Schema
const UserBetSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserBet', // Reference to User model
    required: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet', // Reference to Match model
    required: true
  },
  betOption: {
    type: String,
    enum: ['1', 'X', '2'], // 1 for home win, X for draw, 2 for away win
    required: true
  },
  betCash: {
    type: Number, // The amount of cash the user bet
    required: true
  },
  winCash: {
    type: Number, // The potential winning amount
    required: true
  },
  date: {
    type: Date,
    default: Date.now // Store the date when the bet was placed
  },
  status: {
    type: String,
    enum: ['created','colect','ended'], // Match statuses
    default: 'created'
  }
});

// Pre-save hook to format cash to two decimal places
UserBetSchema.pre('save', function (next) {
  if (this.isModified('betCash') || this.isNew) {
    this.betCash = parseFloat(this.betCash).toFixed(2);
  }
  if (this.isModified('winCash') || this.isNew) {
    this.winCash = parseFloat(this.winCash).toFixed(2);
  }
  next();
});

// Export the UserBet model
module.exports = mongoose.model('UserBetsData', UserBetSchema);
