const UltrasTeamPlayerSchema = new Schema({
    name: { type: String, required: true },
    position: { type: String, required: true }, // e.g., Forward, Midfielder, etc.
    jerseyNumber: { type: Number, required: true },
    team: { type: Schema.Types.ObjectId, ref: 'UltrasTeam' }, // Reference to the team the player belongs to
    nationality: { type: String },
    age: { type: Number }
  }, { timestamps: true });
  
  const UltrasTeamPlayerModel = model('UltrasTeamPlayer', UltrasTeamPlayerSchema);
  module.exports = UltrasTeamPlayerModel;
  