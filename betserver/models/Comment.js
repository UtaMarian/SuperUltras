// models/Comment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'UserBet', required: true },
  text: { type: String, required: true },
  thread: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Comment', CommentSchema);