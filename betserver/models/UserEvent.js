// models/UserBet.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  
  claims: [
    {
      date: { type: Date, default: Date.now },
      reward: {
        cash: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
        trainingPoints: { type: Number, default: 0 },
        positionChangeToken: { type: Number, default: 0 },
        customEffect: { type: String },
      },
    },
  ],

  totalClaims: { type: Number, default: 0 },
  lastClaimDate: { type: Date },

  // Adaugăm câmpul pentru Double Influence
  influenceActiveUntil: { type: Date }, 
});

module.exports = mongoose.model("UserEvent", UserEventSchema);
