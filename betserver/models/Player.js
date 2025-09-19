const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PlayerSchema = new Schema({
  name: { type: String, required: true },
  goals: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  influence: { type: String, default: "" }, // ex: "1.5M"
  position: { type: String, required: true }, // ex: "GK", "ST"
  icon: { type: String, default: "" }, // path spre poză
  team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  user: {type: mongoose.Schema.Types.ObjectId,ref: 'User'},

  // 🔥 atribute de training
  pace: { type: Number, default: 0 },
  shooting: { type: Number, default: 0 },
  passing: { type: Number, default: 0 },
  dribbling: { type: Number, default: 0 },
  defending: { type: Number, default: 0 },
  physicality: { type: Number, default: 0 },

  // câte sesiuni de training mai are jucătorul (poți reseta zilnic/pe săptămână)
  trainingPoints: { type: Number, default: 5 },
  trophies: [
    {
      league: { type: Schema.Types.ObjectId, ref: "League" }, // competiția
      season: { type: Schema.Types.ObjectId, ref: "Season" }, // sezonul
      year: Number,
      name: String 
    }
  ],
  matches:{ type: Number, default: 0 },
  totalInfluence: { type: Number, default: 0 },
  totalGoals: { type: Number, default: 0 },
  totalMatches:{ type: Number, default: 0 }
  
});

module.exports = model("Player", PlayerSchema);
