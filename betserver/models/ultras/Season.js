const SeasonSchema = new Schema({
    year: { type: String, required: true }, // For example "2023/2024"
    league: { type: Schema.Types.ObjectId, ref: 'UltrasLeague' }, // Reference to the league
    standings: [{ type: Schema.Types.ObjectId, ref: 'LeagueStanding' }] // List of standings for the season
  }, { timestamps: true });
  
  const SeasonModel = model('Season', SeasonSchema);
  module.exports = SeasonModel;
  