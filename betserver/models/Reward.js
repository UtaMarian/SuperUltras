const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const RewardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  cash: { type: Number, default: 0 },
  trainingPoints: { type: Number, default: 0 },
  collected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Reward", RewardSchema);
