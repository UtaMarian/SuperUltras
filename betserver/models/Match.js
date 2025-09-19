// models/Match.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const GoalSchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: "Player" },
  team: { type: Schema.Types.ObjectId, ref: "Team" },
  minute: { type: Number } // optional: goal minute
});

const MatchSchema = new Schema({
  league: { type: Schema.Types.ObjectId, ref: "League", required: true },
  season: { type: Schema.Types.ObjectId, ref: "Season", required: true },
  homeTeam: { type: Schema.Types.ObjectId, ref: "Team",  },
  awayTeam: { type: Schema.Types.ObjectId, ref: "Team",},
  homeInfluence: { type: Number, default: 0 },
  awayInfluence: { type: Number, default: 0 },
  status: { type: String, enum: ["scheduled", "in_progress", "finished"], default: "scheduled" },
  score: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
  stage: { type: Number, required: true },
  date: { type: Date, required: true },
  played: { type: Boolean, default: false },
  goals: [GoalSchema] ,
  nextMatchId: { type: Schema.Types.ObjectId, ref: "Match" }, // câștigătorul merge aici
  positionInNextMatch: { type: String, enum: ["home","away"], default: "home" }

  
});

const Match = model("Match", MatchSchema);
module.exports = Match;
