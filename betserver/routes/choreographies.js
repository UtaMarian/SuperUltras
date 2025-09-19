const express = require("express");
const router = express.Router();
const Choreography = require("../models/Choreography");
const User = require("../models/User");
const Match = require("../models/Match");

router.post("/", async (req, res) => {
  try {
    const { matchId, history, moneyTicket } = req.body;

    if (!matchId || !history || !moneyTicket) {
      return res.status(400).json({ message: "Date incomplete" });
    }

    // 1. Găsim utilizatorul
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilizator inexistent" });

    // 2. Verificăm dacă are suficienți bani
    if (user.cash < moneyTicket) {
      return res.status(400).json({ message: "Fonduri insuficiente" });
    }

    // 3. Creăm coregrafia cu echipa favorită
    const choreography = new Choreography({
      match: matchId,
      user: req.user.id,
      history,
      moneyTicket,
      team: user.favTeam, // id-ul echipei favorite
    });
    await choreography.save();

    // 4. Actualizăm influența în match
    const match = await Match.findById(matchId);
    
    if (!match) return res.status(404).json({ message: "Meci inexistent" });

    if (match.homeTeam.toString() === user.favTeam.toString()) {
      match.homeInfluence += moneyTicket;
    } else if (match.awayTeam.toString() === user.favTeam.toString()) {
      match.awayInfluence += moneyTicket;
    }
    await match.save();

    // 5. Scădem banii și salvăm userul
    user.cash -= moneyTicket;
    await user.save();

    res.status(201).json({
      message: "Coregrafie salvată, bani retrași și influență actualizată",
      choreography,
      newCash: user.cash,
      updatedMatch: {
        homeInfluence: match.homeInfluence,
        awayInfluence: match.awayInfluence,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Eroare la salvarea coregrafiei" });
  }
});


// GET - toate coregrafiile pentru un meci
router.get("/match/:matchId", async (req, res) => {
  try {
    const choreographies = await Choreography.find({ match: req.params.matchId })
      .populate("user", "username profilePicture")
      .populate("team", "_id name ")
      .sort({ createdAt: -1 });
    res.json(choreographies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Eroare la obținerea coregrafiilor" });
  }
});

// GET - coregrafiile unui user
router.get("/user/:userId", async (req, res) => {
  try {
    const choreographies = await Choreography.find({ user: req.params.userId })
      .populate("match", "homeTeam awayTeam date");
    res.json(choreographies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Eroare la obținerea coregrafiilor utilizatorului" });
  }
});

module.exports = router;
