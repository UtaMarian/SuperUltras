
const express = require('express');
const UserBet = require('../models/UserBets');
const Match = require('../models/Match');

const router = express.Router();

// Place or update bet
router.post('/place-bet', async (req, res) => {
  try {
    const { matchId, option } = req.body;

    if (!['1', 'X', '2'].includes(option)) {
      return res.status(400).json({ msg: "Invalid bet option" });
    }

    // verificăm dacă există deja un pariu pe acest meci
    let bet = await UserBet.findOne({ user: req.user.id, matchId });

    if (bet) {
      // dacă meciul e încă scheduled -> updatează opțiunea
      const match = await Match.findById(matchId);
      if (match.status !== "scheduled") {
        return res.status(400).json({ msg: "Nu poți modifica un pariu pe un meci început/terminat" });
      }

      bet.betOption = option;
      await bet.save();
      return res.json({ msg: "Pariul a fost actualizat!", bet });
    }

    // dacă nu există, creează pariu nou
    bet = new UserBet({
      user: req.user.id,
      matchId,
      betOption: option,
      betCash: 10,
      winCash: 20,
      status: "created"
    });

    await bet.save();
    res.json({ msg: "Pariu plasat cu succes!", bet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /match/user-bets
router.get('/user-bets', async (req, res) => {
  try {
    const bets = await UserBet.find({ user: req.user.id })
      .populate('matchId')
      .sort({ date: -1 });

    res.json(bets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// POST /match/collect/:betId
router.post('/collect/:betId', async (req, res) => {
  try {
    const bet = await UserBet.findById(req.params.betId);
    if (!bet) return res.status(404).json({ msg: "Bet not found" });
    if (bet.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });
    if (bet.status !== "created") return res.status(400).json({ msg: "Already collected/ended" });

    // aici adaugi logica pentru a verifica dacă a câștigat sau pierdut
    bet.status = "colect";
    await bet.save();

    res.json({ msg: "Bet collected", bet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;