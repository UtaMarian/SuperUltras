const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Team = require("../models/Team");
const User = require("../models/User"); // presupun că ai un model User

// GET: ia toți jucătorii pentru echipa favorită a userului logat
router.get("/my-team", async (req, res) => {
  try {
    // userul logat îl ai probabil în req.user (middleware de auth)
    const userId = req.user.id; 
    console.log("User ID from req.user:", userId);
    const user = await User.findById(userId).populate("favTeam"); 

    if (!user || !user.favTeam) {
      return res.status(404).json({ error: "User sau echipa favorita lipsă" });
    }

 
    const players = await Player.find({ team: user.favTeam._id });
      console.log("User's favorite team:", players);
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: ia toți jucătorii pentru un club dat prin id
router.get("/:clubid/players", async (req, res) => {
  try {
    const { clubid } = req.params;

    // Caută echipa după id
    const club = await Team.findById(clubid);
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Ia toți jucătorii care aparțin echipei
    const players = await Player.find({ team: club._id });
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET favorite team info for the authenticated user
router.get('/my-team-info', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID from req.user:", userId);
   const user = await User.findById(userId).populate({
      path: 'favTeam',
      populate: [
        { path: 'manager', select: 'username profilePicture' },
        { path: 'fromCountry', select: 'name abbreviation' },
        { path: 'fromLeague', select: 'name is_active' }
      ]
    });
    if (!user || !user.favTeam) {
      return res.status(404).json({ message: 'Favorite team not found' });
    }
   
    res.json({ team: user.favTeam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET team info by clubId
router.get('/:clubid/info', async (req, res) => {
  try {
    const { clubid } = req.params;

    const team = await Team.findById(clubid).populate([
      { path: 'manager', select: 'username profilePicture' },
      { path: 'fromCountry', select: 'name abbreviation' },
      { path: 'fromLeague', select: 'name is_active' }
    ]);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST: adaugă un jucător nou la o echipă
router.post("/", async (req, res) => {
  try {
    const { name, goals, level, influence, position, icon, teamId } = req.body;

    const player = new Player({
      name,
      goals,
      level,
      influence,
      position,
      icon,
      team: teamId,
    });

    await player.save();
    res.status(201).json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/:id/formation', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('savedFormation');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    res.json(team.savedFormation || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/formation', async (req, res) => {
  const { formation } = req.body; // e.g. { GK: "playerId1", LB: "playerId2", ... }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Save only first 11 players
    const first11Positions = Object.keys(formation).slice(0, 11);
    const savedFormation = {};
    first11Positions.forEach(pos => {
      savedFormation[pos] = formation[pos];
    });

    team.savedFormation = savedFormation;
    await team.save();

    res.json({ message: 'Formation saved successfully', savedFormation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;