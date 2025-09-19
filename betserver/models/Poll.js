// models/Poll.js
const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votesYes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  votesNo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  endAt: { type: Date, default: Date.now },
  isActive:{type:Boolean,default:true}
});

module.exports = mongoose.model('Poll', pollSchema);
