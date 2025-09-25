const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const TeamSchema = new Schema({
    name: {type: String, required: true, min: 3, unique: true},
    fromLeague:{type:Schema.Types.ObjectId, ref:'League'},
    fromCountry:{type:Schema.Types.ObjectId, ref:'Country'},
    imageUrl:{type:String,default:""},
    manager: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    savedFormation: { type: Map, of: Schema.Types.ObjectId, default: {} } ,
    formationType: { type: String, default: '4-3-3' },
    trophies: [
    {
      league: { type: Schema.Types.ObjectId, ref: "League" }, // competiția
      season: { type: Schema.Types.ObjectId, ref: "Season" }, // sezonul
      year: String,
      name: String 
    }
  ],
  clubOvr:{ type: Number, default: 0 },
  seasonInfluence:{ type: Number, default: 0 },
  records:{type:Schema.Types.ObjectId, ref:'TeamRecords'},
  });

const TeamModel = model('Team', TeamSchema);

module.exports = TeamModel;