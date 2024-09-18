const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const TeamSchema = new Schema({
    name: {type: String, required: true, min: 3, unique: true},
    fromLeague:{type:Schema.Types.ObjectId, ref:'League'},
    fromCountry:{type:Schema.Types.ObjectId, ref:'Country'},
    imageUrl:{type:String,default:""},
  });

const TeamModel = model('Team', TeamSchema);

module.exports = TeamModel;