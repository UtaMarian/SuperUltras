// models/Season.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const SeasonSchema = new Schema({
  name: { type: String,  unique: true }, // e.g. "2024/2025"
  league: { type: Schema.Types.ObjectId, ref: "League", required: true },
  year: { type: Number, required: true }, // e.g. 2025
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  isActive: { type: Boolean, default: true },
  finalStandings: [
    {
      team: { type: Schema.Types.ObjectId, ref: "Team" },
      teamName: String,
      points: Number,
      gf: Number,
      ga: Number,
      gd: Number
    }
  ],
  champion: { type: Schema.Types.ObjectId, ref: "Team" }
});

const Season = model("Season", SeasonSchema);
module.exports = Season;
