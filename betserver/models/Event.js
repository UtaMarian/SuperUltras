const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },                 // Titlul evenimentului
  description: { type: String, required: true },           // Detalii despre ce face
  image: { type: String },                                 // Imagine pentru UI
  type: { 
    type: String, 
    enum: ["daily_reward", "double_influence", "position_changer", "custom"], 
    required: true 
  },                                                       // Tipul de eveniment
  
  startDate: { type: Date, required: true },               // Când începe
  endDate: { type: Date, required: true },                 // Când se termină

  rewards: {                                               // Ce oferă evenimentul
    cash: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    trainingPoints: { type: Number, default: 0 },
    positionChangeToken: { type: Number, default: 0 },
    customEffect: { type: String } // de ex: "double_influence"
  },

  maxClaims: { type: Number, default: 1 },                 // câte ori poate colecta un user (ex: 3 ori la daily)
  claimCooldownHours: { type: Number, default: 24 },       // timp minim între 2 claim-uri (pt daily events)
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", EventSchema);
