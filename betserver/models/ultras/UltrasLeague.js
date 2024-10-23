const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UltrasLeagueSchema = new Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String, ref: 'Country', required: true },
  seasons: [{ type: Schema.Types.ObjectId, ref: 'Season' }] // Reference to the seasons
}, { timestamps: true });

const UltrasLeagueModel = model('UltrasLeague', UltrasLeagueSchema);
module.exports = UltrasLeagueModel;
