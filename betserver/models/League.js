const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const LeagueSchema = new Schema({
    name: {type: String, required: true, min: 3, unique: true},
    no_teams : {type: Number, required: true,default:0},
    is_active: {type:Boolean,default:false},
    seasonEnded: { type: Boolean, default: false },
    currentSeason: { type: mongoose.Schema.Types.ObjectId, ref: "Season", default: null },
    leagueType:{
      type: String,
      enum: ['league','cup'], 
      default: 'league'}
  });

const LeagueModel = model('League', LeagueSchema);

module.exports = LeagueModel;