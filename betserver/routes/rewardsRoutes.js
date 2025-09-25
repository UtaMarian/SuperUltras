// GET /api/rewards
const Reward = require("../models/Reward");
const express = require('express');
const User = require("../models/User");
const Player = require("../models/Player");
const router = express.Router();

// POST /api/rewards/:id/collect
router.post("/:id/collect", async (req, res) => {
  try {
    console.log("Collecting reward for user:", req.user.id, "Reward ID:", req.params.id);
    const reward = await Reward.findOne({
      _id: req.params.id,
      user: req.user.id,
      collected: false
    });

    console.log("Reward found:", reward);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found sau deja colectat" });
    }

    // Update user balance
    const user = await User.findById(req.user.id).populate("player");
    user.cash += reward.cash;
    if (user.player) {
      const player = await Player.findById(user.player);
      if (player) {
        player.trainingPoints += reward.trainingPoints;
        await player.save();
      }
    }
    await user.save();

    // Mark reward as collected
    reward.collected = true;
    await reward.save();

    res.json({ message: "✅ Reward colectat cu succes", reward });
  } catch (err) {
    console.error("❌ Error collecting reward:", err);
    res.status(500).json({ message: "Eroare la colectarea rewardului" });
  }
});

router.get("/", async (req, res) => {
  try {
    console.log("Fetching rewards for user:", req.user.id);
    const rewards = await Reward.find({
      user: req.user.id,
      collected: false
    })
      .populate("match", "stage date")
      .sort({ createdAt: -1 });

    res.json(rewards);
  } catch (err) {
    console.error("❌ Error fetching rewards:", err);
    res.status(500).json({ message: "Eroare la obținerea recompenselor" });
  }
});



module.exports = router;