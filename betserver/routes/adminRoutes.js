const express = require('express');
const router = express.Router();
const League = require("../models/League");
const Season = require("../models/Season");
const Team = require("../models/Team");
const Match = require("../models/Match");

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

router.post("/generatecup", async (req, res) => {
  try {
    const { teamIds, cupName } = req.body;
    const currentYear = new Date().getFullYear();

    if (![2,4,8,16].includes(teamIds.length)) {
      return res.status(400).json({ message: "Număr invalid de echipe. Trebuie 2,4,8 sau 16." });
    }

    // Crează liga cupă
    const league = new League({
      name: cupName,
      no_teams: teamIds.length,
      is_active: true,
      leagueType: "cup"
    });
    await league.save();

    // Crează sezonul cupă
    const season = new Season({
      league: league._id,
      year: currentYear,
      isActive: true
    });
    await season.save();
    league.currentSeason = season._id;
    await league.save();

    // Fetch echipe
    const teams = await Team.find({ _id: { $in: teamIds } });

    // Shuffle pentru random bracket
    const bracket = shuffle(teams);

    const matches = [];
    let stage = 1;
    let roundMatches = [];
    let nextStageMatches = [];

    // Generare meciuri Round 1
    for (let i = 0; i < bracket.length; i += 2) {
      const match = new Match({
        league: league._id,
        season: season._id,
        homeTeam: bracket[i]._id,
        awayTeam: bracket[i+1]._id,
        stage,
        round: `Round ${stage}`,
        status: "scheduled",
        date: new Date(),
      });
      await match.save();
      roundMatches.push(match);
    }

    // Generare meciuri următoare etape (către final)
    let matchesThisStage = roundMatches;
    while (matchesThisStage.length > 1) {
      const nextMatches = [];
      for (let i = 0; i < matchesThisStage.length; i += 2) {
        const match = new Match({
          league: league._id,
          season: season._id,
          stage: stage + 1,
          round: `Round ${stage + 1}`,
          status: "scheduled",
          date: new Date(),
          // homeTeam & awayTeam se vor completa după ce câștigătorii meciurilor anterioare sunt disponibili
        });
        await match.save();

        // Set nextMatchId în meciurile precedente
        matchesThisStage[i].nextMatchId = match._id;
        matchesThisStage[i+1].nextMatchId = match._id;
        await matchesThisStage[i].save();
        await matchesThisStage[i+1].save();

        nextMatches.push(match);
      }
      matchesThisStage = nextMatches;
      stage++;
    }

    res.json({ message: "Turneu generat", league, season });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
