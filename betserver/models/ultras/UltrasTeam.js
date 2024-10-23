const UltrasTeamSchema = new Schema({
    name: { type: String, required: true, unique: true, min: 3 },
    fromLeague: { type: Schema.Types.ObjectId, ref: 'UltrasLeague' },
    fromCountry: { type: Schema.Types.ObjectId, ref: 'Country' },
    imageUrl: { type: String, default: "" },
    players: [{ type: Schema.Types.ObjectId, ref: 'UltrasTeamPlayer' }] // Reference to players in the team
  }, { timestamps: true });
  
  const UltrasTeamModel = model('UltrasTeam', UltrasTeamSchema);
  module.exports = UltrasTeamModel;
  