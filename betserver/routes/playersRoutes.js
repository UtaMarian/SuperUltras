const express = require("express");
const Player = require("../models/Player");

const router = express.Router();

// GET all players by teamId
router.get("/by-team/:teamId", async (req, res) => {
  try {
     const players = await Player.find({ team: req.params.teamId }); // returnează array chiar dacă e gol
    res.json(players); // chiar dacă nu există jucători, trimite []
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
