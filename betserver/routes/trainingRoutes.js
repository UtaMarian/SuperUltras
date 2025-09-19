
// routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const Player = require("../models/Match");
const User = require("../models/User");

// GET: info despre atributele unui jucător
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id; 
   
    const user = await User.findById(userId).populate("player");
    const player = user.player;
     console.log(player)
    if (!player) return res.status(404).json({ error: "Player not found" });

    res.json({
      player
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: antrenează un jucător pe un atribut
router.put("/players/train", async (req, res) => {
  try {
    const userId = req.user.id; 
    const { attribute } = req.body; // ex: "pace", "shooting" etc.
    const validAttributes = ["pace", "shooting", "passing", "dribbling", "defending", "physicality"];

    if (!validAttributes.includes(attribute)) {
      return res.status(400).json({ error: "Invalid attribute" });
    }

    const user = await User.findById(userId).populate("player");
    const player = user.player;
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (player.trainingPoints <= 0) {
      return res.status(400).json({ error: "No training points left" });
    }

    // ✅ verificăm să nu treacă peste 100
    if (player[attribute] >= 100) {
      return res.status(400).json({ error: `${attribute} is already at maximum (100)` });
    }

    // crește atributul și consumă un punct de antrenament
    player[attribute] = Math.min(player[attribute] + 1, 100); 
    player.trainingPoints -= 1;

    // logica pentru level up (media atributelor / un prag)
    const totalAttributes = 
      player.pace + 
      player.shooting + 
      player.passing + 
      player.dribbling + 
      player.defending + 
      player.physicality;

    const avg = totalAttributes / 6;
    player.level = Math.floor(avg / 10); // ex: la fiecare +10 la medie -> level up

    await player.save();

    res.json({ message: `Player trained in ${attribute}`, player });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;