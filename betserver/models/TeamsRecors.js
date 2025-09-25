const mongoose = require('mongoose');
const {Schema, model} = mongoose;


const TeamRecordsSchema = new Schema({
  biggestInfluenceInSeason:{ type: Number, default: 0 },
  biggestInfluenceInMatch:{ type: Number, default: 0 },
  biggestWin:{ type: String, default: "0-0" },
  biggestGoalsInSeason:{ type: Number, default: 0 },
  mostSupportersInMatch:{ type: Number, default: 0 },

});

const TeamRecordsModel = model('TeamRecords', TeamRecordsSchema);

module.exports = TeamRecordsModel;
