// utils/knockoutGenerator.js
const Match = require("../models/Match");

/**
 * Creează un bracket knockout pentru echipele date
 * @param {Array} teams - echipele participante
 * @param {ObjectId} leagueId - id-ul cupei
 * @param {Date} startDate - data de start
 * @returns {Array} matches create
 */
async function generateKnockout(teams, leagueId, seasonId) {
  const matches = [];
  const shuffled = teams.sort(() => Math.random() - 0.5);

  // Round of 16
  for (let i = 0; i < shuffled.length; i += 2) {
    const match = new Match({
      league: leagueId,
      season: seasonId,
      homeTeam: shuffled[i]._id,
      awayTeam: shuffled[i + 1]._id,
      date: new Date(),
      round: "R16",
      stage: 1,
      status: "scheduled",
    });
    await match.save();
    matches.push(match);
  }

  return matches;
}
module.exports = { generateKnockout };
