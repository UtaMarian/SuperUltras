const express = require("express");
const Team = require('../models/Team');
const League = require('../models/League');
const Country = require('../models/Country');
const Player = require("../models/Player");
const User = require("../models/User"); 
const Match = require("../models/Match");

const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'teamslogo/' });
const fs = require('fs');



// GET all teams
router.get('/', async (req, res) => {
    try {
      const teams = await Team.find()
        .populate('fromLeague', 'name is_active')
        .populate('fromCountry', 'name abbreviation');
      res.json(teams);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  


  // GET a single team by ID
  router.get('/:id', async (req, res) => {
    try {
      const team = await Team.findById(req.params.id)
        .populate('fromLeague', 'name is_active')
        .populate('fromCountry', 'name abbreviation');
      if (!team) return res.status(404).json({ message: 'Team not found' });
      res.json(team);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  // CREATE a new team
router.post('/', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const { name, fromLeague, fromCountry } = req.body;

  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  // Validation
  if (name.length < 3) {
    return res.status(400).json({ message: 'Name must be at least 3 characters long' });
  }

  try {
    // Check if League exists
    const leagueExists = await League.findById(fromLeague);
    if (!leagueExists) return res.status(400).json({ message: 'League not found' });

    // Check if Country exists
    const countryExists = await Country.findById(fromCountry);
    if (!countryExists) return res.status(400).json({ message: 'Country not found' });

    const team = new Team({
      name,
      fromLeague,
      fromCountry,
      imageUrl: newPath,
    });

    const newTeam = await team.save();

    // 🔥 Create 11 bot players
    const botNames = generateRandomNames(11);
    const positions = ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "RM", "RW", "ST", "LW"];

    const botPlayers = botNames.map((botName, idx) => ({
      name: botName,
      level: 0,
      goals: 0,
      position: positions[idx],
      team: newTeam._id,
      icon: "", // optional default avatar
    }));

    await Player.insertMany(botPlayers);

    res.status(201).json({ team: newTeam, bots: botPlayers });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Team name already exists' });
    }
    res.status(400).json({ message: err.message });
  }
});

// 👉 Helper to generate random names
function generateRandomNames(count) {
  const firstNames = ["Alex", "Chris", "Sam", "Jordan", "Taylor", "Jamie", "Robin", "Casey", "Charlie", "Drew","Leo","Max","Riley","Cameron","Avery","Quinn","Parker","Hayden","Dakota","Skyler","Jesse","Morgan","Reese","Rowan","Sage","Tatum","Emerson","Finley","Harper","Kendall","Logan","Payton","Rory","Sawyer","Spencer","Sydney","Teagan","Cristiano","Lionel","Neymar","Kylian","Zlatan","Eden","Luka","Sergio","Paul","Kevin","Toni","Robert","David","Andres","Xavi","Thiago","Philippe","Gareth","Raheem","Mason","Jadon","Bukayo","Heung-min","Son","Erling","Haaland","Jude","Bellingham","Vinicius","Rodrygo","Federico","Chiesa","Dusan","Vlahovic","Pedri","Gavi","Ansu","Fati","Jamal","Musiala","Jamal","Sancho","Marcus","Rashford","Bruno","Fernandes","Christian","Pulisic","Mason","Mount","Declan","Rice","Kalvin","Phillips","Marian"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Peterson","Lucescu","Iordanescu","Hagi","Popescu","Dica","Radoi","Mutu"];

  const names = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    names.push(`${first} ${last}`);
  }
  return names;
}

  
  // UPDATE a team
  router.put('/:id', async (req, res) => {
    const { name, fromLeague, fromCountry } = req.body;
  
    try {
      const team = await Team.findById(req.params.id);
      if (!team) return res.status(404).json({ message: 'Team not found' });
  
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }
        team.name = name;
      }
  
      if (fromLeague) {
        // Check if League exists
        const leagueExists = await League.findById(fromLeague);
        if (!leagueExists) return res.status(400).json({ message: 'League not found' });
        team.fromLeague = fromLeague;
      }
  
      if (fromCountry) {
        // Check if Country exists
        const countryExists = await Country.findById(fromCountry);
        if (!countryExists) return res.status(400).json({ message: 'Country not found' });
        team.fromCountry = fromCountry;
      }
  
      const updatedTeam = await team.save();
      res.json(updatedTeam);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'Team name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
 router.put('/:id/manager', async (req, res) => {
  const { managerId } = req.body; // aici managerId este playerId
  console.log("Setting manager (playerId):", managerId, "for team:", req.params.id);

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // găsim playerul
    const player = await Player.findById(managerId);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    // verificăm dacă playerul e în această echipă
    if (player.team.toString() !== team._id.toString()) {
      return res.status(400).json({ message: 'Player is not in this team' });
    }

    // găsim userul asociat playerului
    const user = await User.findOne({ player: player._id });
    if (!user) return res.status(404).json({ message: 'User not found for this player' });

    // setăm managerul ca userId
    team.manager = user._id;
    await team.save();

    res.json({ message: 'Manager updated successfully', team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
  // DELETE a team
  router.delete('/:id', async (req, res) => {
    try {
      //TODO delete all bets that implicate this team

      
      const result = await Team.deleteOne({ _id: req.params.id });

      // Check if the deletion was successful
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Team not found' });
      }


    
      res.json({ message: 'Team deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
    // GET: forma echipelor dintr-o ligă
router.get('/form/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;

    // găsim toate echipele din ligă
    const teams = await Team.find({ fromLeague: leagueId }).select('_id name');

    if (!teams || teams.length === 0) {
      return res.status(404).json({ msg: "No teams found in this league" });
    }

    // găsim toate meciurile jucate în această ligă
    const matches = await Match.find({
      league: leagueId,
      status: "finished"
    }).sort({ date: -1 });

    const teamForms = {};

    // pentru fiecare echipă, extragem ultimele 5 meciuri
    for (const team of teams) {
      const lastMatches = matches.filter(
        m => m.homeTeam.toString() === team._id.toString() ||
             m.awayTeam.toString() === team._id.toString()
      ).slice(0, 5);

      const form = lastMatches.map(match => {
        if (!match.score) return "D"; // fallback

        const { home, away } = match.score;
        const isHome = match.homeTeam.toString() === team._id.toString();

        if (home === away) return "D";
        if (isHome && home > away) return "W";
        if (!isHome && away > home) return "W";
        return "L";
      });

      teamForms[team._id] = {
        teamId: team._id,
        teamName: team.name,
        form
      };
    }

    res.json(teamForms);

  } catch (err) {
    console.error("Error fetching league form:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET trofee pentru o echipă
router.get("/:id/trophies", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("trophies.league trophies.season");
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json(team.trophies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
  module.exports = router;