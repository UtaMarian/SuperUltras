const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: {type: String,required: true, unique: true},
  email: {type: String,required: true,unique: true},
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  cash: {type: Number,default: 1000},
  coins: {type: Number,default: 0},
  favTeam: {type: mongoose.Schema.Types.ObjectId,ref: 'Team'},
  role: {type: String,enum: ['admin', 'moderator', 'user'],default: 'user'},
  dailyCashCollect: { type: Number, default: 0},
  profilePicture: { type: String},
  rank: {type: mongoose.Schema.Types.ObjectId,ref: 'Rank'},
  lastLogin: Date,
  lastCashCollectionDate: Date,
  player: {type: mongoose.Schema.Types.ObjectId,ref: 'Player'},
  tutorialCompleted: { type: Boolean, default: false },
  trophies: [
  {
    league: { type: mongoose.Schema.Types.ObjectId, ref: "League" }, // competiția
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" }, // sezonul
    year: String,
    name: String,
    numbers: { type: Number, default: 1 }
  }
],
});

// Pre-save hook to format cash to two decimal places
UserSchema.pre('save', function (next) {
  if (this.isModified('cash') || this.isNew) {
    this.cash = parseFloat(this.cash).toFixed(2);
  }
  next();
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
  
// Compare password method for authentication
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
