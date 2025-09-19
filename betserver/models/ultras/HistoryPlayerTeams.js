const HistoryPlayerTeamsSchema = new Schema({
    player: { type: Schema.Types.ObjectId, ref: 'UltrasTeamPlayer', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'UltrasTeam', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date } // If null, the player is currently in this team
  }, { timestamps: true });
  
  const HistoryPlayerTeamsModel = model('HistoryPlayerTeams', HistoryPlayerTeamsSchema);
  module.exports = HistoryPlayerTeamsModel;
  