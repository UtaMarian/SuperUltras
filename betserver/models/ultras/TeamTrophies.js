const TeamTrophiesSchema = new Schema({
    team: { type: Schema.Types.ObjectId, ref: 'UltrasTeam', required: true },
    trophyName: { type: String, required: true }, // e.g., "Premier League", "Champions League"
    season: { type: Schema.Types.ObjectId, ref: 'Season', required: true } // The season in which the trophy was won
  }, { timestamps: true });
  
  const TeamTrophiesModel = model('TeamTrophies', TeamTrophiesSchema);
  module.exports = TeamTrophiesModel;
  