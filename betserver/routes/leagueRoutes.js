const express = require("express");
const League = require('../models/League');
const router = express.Router();

const Season = require("../models/Season");
const Match = require("../models/Match");
const Team = require("../models/Team");
const  authMiddleware = require( "../middleware/auth" );
// GET all leagues
router.get('/', async (req, res) => {
    try {
      const leagues = await League.find();
      res.json(leagues);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
router.get("/standings", authMiddleware, async (req, res) => {
  try {
    // 1. Get favorite team from authenticated user
    const favoriteTeamId = req.user.favoriteTeam;
    if (!favoriteTeamId) {
      return res.status(400).json({ msg: "User has no favorite team" });
    }

    // 2. Find the team and populate its league
    const favTeam = await Team.findById(favoriteTeamId).populate("fromLeague");
    if (!favTeam || !favTeam.fromLeague) {
      return res.status(404).json({ msg: "Favorite team or league not found" });
    }

    const userLeagueId = favTeam.fromLeague._id;

    // 3. Get all teams in this league and include imageUrl
    const teams = await Team.find({ fromLeague: userLeagueId }).select("name imageUrl");
    if (!teams || teams.length === 0) {
      return res.status(404).json({ msg: "No teams found in this league" });
    }

    // 4. Initialize standings
    const standings = teams.map(team => ({
      _id: team._id,
      name: team.name,
      imageUrl: team.imageUrl, // ✅ include imageUrl
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0
    }));

    // Quick lookup
    const standingsMap = {};
    standings.forEach(s => (standingsMap[s._id.toString()] = s));

    // 5. Get matches from this league (current season assumed)
    const matches = await Match.find({
      league: userLeagueId,
      season: favTeam.fromLeague.currentSeason // requires currentSeason in league model
    });

    // 6. Process matches into standings
    matches.forEach(match => {
      if (!match.homeTeam || !match.awayTeam) return;
      if (match.status !== "finished" || !match.score) return;

      const home = standingsMap[match.homeTeam.toString()];
      const away = standingsMap[match.awayTeam.toString()];
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;

      const { home: homeGoals, away: awayGoals } = match.score;

      if (homeGoals > awayGoals) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

    // 7. Sort standings
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.name.localeCompare(b.name);
    });

    res.json({
      league: favTeam.fromLeague.name,
      standings
    });
  } catch (err) {
    console.error("Error fetching standings:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/active",  async (req, res) => {
  try {
    // Găsim toate ligile care au un sezon curent
    console.log("Fetching active leagues...");
    const leagues = await League.find({ is_active: { $eq: true } })
      .select("_id name currentSeason leagueType");

      console.log(leagues);
    if (!leagues || leagues.length === 0) {
      return res.status(404).json({ msg: "No active leagues found" });
    }

    res.json(leagues);
  } catch (err) {
    console.error("Error fetching active leagues:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
  // GET a single league by ID
  router.get('/:id', async (req, res) => {
    try {
      const league = await League.findById(req.params.id);
      if (!league) return res.status(404).json({ message: 'League not found' });
      res.json(league);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // CREATE a new league
  router.post('/', async (req, res) => {
    const { name, no_teams, is_active } = req.body;
  
    // Validation
    if (name.length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }
  
    const league = new League({
      name,
      no_teams,
      is_active,
      leagueType:"league"
    });
  
    try {
      const newLeague = await league.save();
      res.status(201).json(newLeague);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'League name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // UPDATE a league
  router.put('/:id', async (req, res) => {
    const { name, no_teams, is_active } = req.body;
  
    try {
      const league = await League.findById(req.params.id);
      if (!league) return res.status(404).json({ message: 'League not found' });
  
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }
        league.name = name;
      }
  
      if (typeof no_teams === 'number') {
        league.no_teams = no_teams;
      }
  
      if (typeof is_active === 'boolean') {
        league.is_active = is_active;
      }
  
      const updatedLeague = await league.save();
      res.json(updatedLeague);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'League name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a league
  router.delete('/:id', async (req, res) => {
    try {
      const result = await League.deleteOne({ _id: req.params.id });

      // Check if the deletion was successful
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'League not found' });
      }

      res.json({ message: 'League deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // START LEAGUE
router.post("/:id/start", async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) return res.status(404).json({ message: "League not found" });

    // close old season if still active
    await Season.updateMany(
      { league: league._id, isActive: true },
      { isActive: false, endedAt: new Date() }
    );

    // create new season
    const season = new Season({
      league: league._id,
      year: new Date().getFullYear(),
      isActive: true,
    });
    await season.save();

    league.currentSeason = season._id;
    await league.save();

    // get teams
    const teams = await Team.find({ fromLeague: league._id });
    if (teams.length !== 14) {
      return res.status(400).json({ message: "League must have exactly 14 teams" });
    }

    // round-robin schedule
    let teamIds = teams.map(t => t._id.toString());
    let matches = [];

    for (let round = 0; round < 28; round++) {
      // ziua etapei
      let baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + round); // fiecare rundă în altă zi
      baseDate.setHours(16, 0, 0, 0); // ora de start 16:00

      for (let i = 0; i < teamIds.length / 2; i++) {
        let home = teamIds[i];
        let away = teamIds[teamIds.length - 1 - i];
        if (round % 2 === 1) [home, away] = [away, home];

        // fiecare meci la +30 min față de precedentul
        let matchDate = new Date(baseDate.getTime() + i * 30 * 60 * 1000);

        matches.push({
          league: league._id,
          season: season._id,
          homeTeam: home,
          awayTeam: away,
          stage: round + 1,
          date: matchDate,
        });
      }

      // rotire echipe pentru algoritmul round-robin
      teamIds.splice(1, 0, teamIds.pop());
    }

    await Match.insertMany(matches);

    league.is_active = true;
    await league.save();

    res.json({ message: "Season started", season, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/:id/end", async (req, res) => {
  try {
    const league = await League.findById(req.params.id).populate("currentSeason");
    if (!league) return res.status(404).json({ message: "League not found" });

    const matches = await Match.find({ league: league._id }).populate("homeTeam awayTeam");
    const unplayed = matches.filter(m => !m.played);

    if (unplayed.length > 0) {
      return res.status(400).json({ message: "Not all matches are played yet" });
    }

    league.is_active = false;
    league.seasonEnded = true;
    await league.save();

    if (league.leagueType === "league") {
      // --- logica pentru liga normală ---
      const standings = {};
      matches.forEach(match => {
        if (!standings[match.homeTeam._id]) standings[match.homeTeam._id] = { team: match.homeTeam, points: 0, gf: 0, ga: 0 };
        if (!standings[match.awayTeam._id]) standings[match.awayTeam._id] = { team: match.awayTeam, points: 0, gf: 0, ga: 0 };

        standings[match.homeTeam._id].gf += match.score.home;
        standings[match.homeTeam._id].ga += match.score.away;
        standings[match.awayTeam._id].gf += match.score.away;
        standings[match.awayTeam._id].ga += match.score.home;

        if (match.score.home > match.score.away) standings[match.homeTeam._id].points += 3;
        else if (match.score.home < match.score.away) standings[match.awayTeam._id].points += 3;
        else {
          standings[match.homeTeam._id].points += 1;
          standings[match.awayTeam._id].points += 1;
        }
      });

      const table = Object.values(standings).map(s => ({
        team: s.team._id,
        teamName: s.team.name,
        points: s.points,
        gf: s.gf,
        ga: s.ga,
        gd: s.gf - s.ga
      }));

      table.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

      const champion = table[0];

      if (league.currentSeason) {
        league.currentSeason.isActive = false;
        league.currentSeason.endedAt = new Date();
        league.currentSeason.finalStandings = table;
        league.currentSeason.champion = champion.team;
        await league.currentSeason.save();
      }

      await Team.findByIdAndUpdate(champion.team, {
        $push: {
          trophies: {
            league: league._id,
            season: league.currentSeason?._id,
            year: league.currentSeason?.name,
            name: "Campionat"
          }
        }
      });
      const usersWithFavTeam = await User.find({ favoriteTeam: champion.team });
      for (const user of usersWithFavTeam) {
        user.trophies.push({
          league: league._id,
          season: league.currentSeason?._id,
          year: league.currentSeason?.name,
          name: "Campionat"
        });
        await user.save();
      }

      return res.json({ message: "Season ended successfully", champion, standings: table });
    } 
    else if (league.leagueType === "cup") {
      // --- logica pentru cupă ---
      // câștigătorul este echipa care a câștigat finala
      const finalMatch = matches[matches.length - 1]; // sau găsește match-ul final cu played=true
      let championTeam = finalMatch?.homeScore > finalMatch?.awayScore ? finalMatch.homeTeam : finalMatch.awayTeam;

      if (!championTeam) return res.status(400).json({ message: "Final match has no winner yet" });

    
     
      await Team.findByIdAndUpdate(championTeam._id, {
        $push: {
          trophies: {
            league: league._id,
            season: league.currentSeason?._id,
            year: new Date().getFullYear(),
            name: league.name // numele turneului
          }
        }
      });

      return res.json({ message: "Cup ended successfully", champion: championTeam });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET current matches based on user's favorite team (no leagueId in URL)
router.get("/matches/current", authMiddleware, async (req, res) => {
  try {
    const favoriteTeamId = req.user.favoriteTeam;
    if (!favoriteTeamId) {
      return res.status(400).json({ message: "User has no favorite team" });
    }

    // Find team and its league
    const favTeam = await Team.findById(favoriteTeamId).populate("fromLeague");
    if (!favTeam || !favTeam.fromLeague) {
      return res.status(404).json({ message: "Favorite team or league not found" });
    }

    const league = favTeam.fromLeague;
    if (!league.currentSeason) {
      return res.status(400).json({ message: "No current season for this league" });
    }

    // Fetch current season
    const season = await Season.findById(league.currentSeason);
    if (!season) return res.status(404).json({ message: "Current season not found" });

    // Fetch matches and populate name + imageUrl
    const matches = await Match.find({
      league: league._id,
      season: season._id
    })
      .populate("homeTeam awayTeam", "name imageUrl") // ✅ include imageUrl
      .sort({ stage: 1 });

    res.json({ season, matches });
  } catch (err) {
    console.error("Error fetching matches/current:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET all matches from a league season
router.get("/:leagueId/:seasonId/matches", async (req, res) => {
  try {
    const { leagueId, seasonId } = req.params;

    const season = await Season.findOne({ _id: seasonId, league: leagueId });
    if (!season) return res.status(404).json({ message: "Season not found" });

    const matches = await Match.find({ league: leagueId, season: seasonId })
      .populate("homeTeam awayTeam", "name")
      .sort({ stage: 1 });

    res.json({ season, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET matches for a given day (yesterday, today, tomorrow) grouped by league
router.get("/matches/:day", async (req, res) => {
  try {
    const { day } = req.params;

    const today = new Date();
    let targetDate = new Date(today);

    if (day === "yesterday") {
      targetDate.setDate(today.getDate() - 1);
    } else if (day === "tomorrow") {
      targetDate.setDate(today.getDate() + 1);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const matches = await Match.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      homeTeam: { $exists: true, $ne: null },
      awayTeam: { $exists: true, $ne: null }
    })
      .populate("homeTeam awayTeam league", "name imageUrl")
      .sort({ datetime: 1 });

     
    // Grupăm după ligă
    const groupedByLeague = matches.reduce((acc, match) => {
      const leagueId = match.league._id.toString();
      if (!acc[leagueId]) {
        acc[leagueId] = {
          league: match.league,
          matches: [],
        };
      }
      acc[leagueId].matches.push(match);
      return acc;
    }, {});


    res.json(Object.values(groupedByLeague));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/leagues/:leagueId/standings
router.get("/:leagueId/standings",  async (req, res) => {
  try {
    const { leagueId } = req.params;

    // 1. Verifică liga
    const league = await League.findById(leagueId);
    if (!league) return res.status(404).json({ msg: "League not found" });

    // 2. Ia toate echipele din ligă
    const teams = await Team.find({ fromLeague: leagueId }).select("name imageUrl");
    if (!teams || teams.length === 0) {
      return res.status(404).json({ msg: "No teams in this league" });
    }

    // 3. Initializează clasamentul
    const standings = teams.map(team => ({
      _id: team._id,
      name: team.name,
      imageUrl: team.imageUrl,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0
    }));

    const standingsMap = {};
    standings.forEach(s => (standingsMap[s._id.toString()] = s));

    // 4. Ia meciurile ligii în sezonul curent
   const matches = await Match.find({
    league: leagueId,
    season: league.currentSeason,
    homeTeam: { $exists: true, $ne: null },
    awayTeam: { $exists: true, $ne: null }
  });

    // 5. Procesează scorurile
    matches.forEach(match => {
      if (!match.homeTeam || !match.awayTeam) return;
      if (match.status !== "finished" || !match.score) return;

      const home = standingsMap[match.homeTeam.toString()];
      const away = standingsMap[match.awayTeam.toString()];
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;

      const { home: homeGoals, away: awayGoals } = match.score;

      if (homeGoals > awayGoals) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

    // 6. Sortează clasamentul
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.name.localeCompare(b.name);
    });

    res.json({
      league: league.name,
      standings
    });
  } catch (err) {
    console.error("Error fetching standings:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/leagues/:leagueId/matches
router.get("/:leagueId/matches",  async (req, res) => {
  try {
    const { leagueId } = req.params;

    const league = await League.findById(leagueId);
    if (!league || !league.currentSeason) {
      return res.status(404).json({ message: "League or current season not found" });
    }

    const matches = await Match.find({
      league: leagueId,
      season: league.currentSeason
    })
      .populate("homeTeam awayTeam", "name imageUrl")
      .sort({ stage: 1 });

    res.json({ matches });
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /cups/:id - return tournament bracket
router.get('/cup/:id', async (req, res) => {
  try {
    const cupId = req.params.id;

    // Load cup and its current season
    const cup = await League.findById(cupId).populate('currentSeason');
    if (!cup) return res.status(404).json({ message: 'Turneu nu a fost găsit' });

    const season = cup.currentSeason;
    if (!season) return res.status(404).json({ message: 'Sezonul curent nu a fost găsit' });

    // Fetch all matches of the season, sorted by stage
    const matches = await Match.find({ league: cup._id, season: season._id })
     .populate("homeTeam awayTeam", "name imageUrl")
                               .sort({ stage: 1, date: 1 })
                               .lean();

    // Group matches by stage (round)
    const roundsMap = {};
    matches.forEach(match => {
      if (!roundsMap[match.stage]) roundsMap[match.stage] = [];
      roundsMap[match.stage].push({
        id: match._id,
        homeTeam: match.homeTeamName || match.homeTeam, // optional: populate name if needed
        awayTeam: match.awayTeamName || match.awayTeam,
        homeScore: match.score.home,
        awayScore: match.score.away,
        played: match.played
      });
    });

    const rounds = Object.keys(roundsMap).sort().map(stage => ({
      name: stage,
      matches: roundsMap[stage]
    }));

    res.json({
      tournamentName: cup.name,
      rounds
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
  module.exports = router;