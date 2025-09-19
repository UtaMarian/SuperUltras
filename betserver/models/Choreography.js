const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ChoreographySchema = new Schema({
  match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  history: { type: Array, required: true }, // lista de litere/culori/icoane
  moneyTicket: { type: Number, required: true }, // costul total calculat
  team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  createdAt: { type: Date, default: Date.now }
});

const Choreography = model("Choreography", ChoreographySchema);
module.exports = Choreography;
