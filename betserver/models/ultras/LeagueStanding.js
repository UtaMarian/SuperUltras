const LeagueStandingSchema = new Schema({
    team: { type: Schema.Types.ObjectId, ref: 'UltrasTeam', required: true }, // Team in the standings
    season: { type: Schema.Types.ObjectId, ref: 'Season', required: true }, // The season it belongs to
    playedGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  }, { timestamps: true });
  
  const LeagueStandingModel = model('LeagueStanding', LeagueStandingSchema);
  module.exports = LeagueStandingModel;
  