// routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const User = require("../models/User");

// GET next match of favorite team (based on logged user)
router.get("/next/my-team", async (req, res) => {
  try {

    const userId = req.user.id; // din middleware-ul de auth
    const user = await User.findById(userId).populate("favTeam");

    if (!user || !user.favTeam) {
      return res.status(404).json({ message: "Favorite team not set" });
    }

    const favTeamId = user.favTeam._id;
    const now = new Date();

    const nextMatch = await Match.findOne({
      $and: [
        { date: { $gte: now } },
        { $or: [{ homeTeam: favTeamId }, { awayTeam: favTeamId }] }
      ]
    })
      .populate("homeTeam", "name manager imageUrl savedFormation formationType clubOvr")
      .populate("awayTeam", "name manager imageUrl savedFormation formationType clubOvr")
      .populate("league", "name flag")
      .sort({ date: 1 })
      .exec();

    if (!nextMatch) {
      return res.status(404).json({ message: "No upcoming match found" });
    }

    res.json(nextMatch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/next3", async (req, res) => {
 try {
  
    const userId = req.user.id; 
    const user = await User.findById(userId).populate("favTeam");

    if (!user || !user.favTeam) {
      return res.status(404).json({ message: "Favorite team not set" });
    }

    const favTeamId = user.favTeam._id;
    const now = new Date();
    const pastLimit = new Date();
    pastLimit.setDate(now.getDate() - 2);

    const futureLimit = new Date();
    futureLimit.setDate(now.getDate() + 3);

    const nextMatch = await Match.find({
      date: { $gte: pastLimit, $lte: futureLimit },
      $or: [
        { homeTeam: favTeamId },
        { awayTeam: favTeamId }
      ]
    })
      .populate("homeTeam", "name manager imageUrl clubOvr")
      .populate("awayTeam", "name manager imageUrl clubOvr")
      .populate("league", "name flag")
      .sort({ date: 1 })
      .exec();

    if (!nextMatch) {
      return res.status(404).json({ message: "No upcoming match found" });
    }

    res.json(nextMatch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET match by ID
router.get("/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const match = await Match.findById(matchId)
      .populate("homeTeam", "name manager imageUrl savedFormation formationType clubOvr")
      .populate("awayTeam", "name manager imageUrl savedFormation formationType clubOvr")
      .populate("league", "name flag")
      .populate("season", "year isActive")
      .populate({
    path: "goals.player",
    select: "name" // ia doar numele jucătorului
  });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
