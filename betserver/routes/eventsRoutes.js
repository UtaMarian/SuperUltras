const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const multer = require("multer");
const fs = require("fs");
const UserEvent = require("../models/UserEvent");
const User = require("../models/User");
const mongoose = require('mongoose');

// Setup multer for file uploads
const uploadMiddleware = multer({ dest: "eventsimg/" });

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// CREATE event
router.post("/", uploadMiddleware.single("file"), async (req, res) => {
  const {
    title,
    description,
    type,
    startDate,
    endDate,
    cash,
    coins,
    trainingPoints,
    maxClaims,
    claimCooldownHours,
  } = req.body;

  let imageUrl = "";

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = `${path}.${ext}`;
    fs.renameSync(path, newPath);
    imageUrl = newPath;
  }

  try {
    const newEvent = new Event({
      title,
      description,
      type,
      startDate,
      endDate,
      rewards: {
        cash: cash || 0,
        coins: coins || 0,
        trainingPoints: trainingPoints || 0,
      },
      maxClaims: maxClaims || 1,
      claimCooldownHours: claimCooldownHours || 24,
      image: imageUrl,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

// UPDATE event
router.put("/:id", uploadMiddleware.single("file"), async (req, res) => {
  const {
    title,
    description,
    type,
    startDate,
    endDate,
    cash,
    coins,
    trainingPoints,
    maxClaims,
    claimCooldownHours,
  } = req.body;

  let updateFields = {
    title,
    description,
    type,
    startDate,
    endDate,
    rewards: {
      cash: cash || 0,
      coins: coins || 0,
      trainingPoints: trainingPoints || 0,
    },
    maxClaims: maxClaims || 1,
    claimCooldownHours: claimCooldownHours || 24,
  };

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = `${path}.${ext}`;
    fs.renameSync(path, newPath);
    updateFields.image = newPath;
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// router.get("/:id", async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Claim reward for an event
router.post("/:eventId/claim", async (req, res) => {
  try {
    const userId = req.user.id; // presupunem că middleware-ul auth bagă userul aici
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Găsește UserEvent sau creează unul nou
    let userEvent = await UserEvent.findOne({ user: userId, event: eventId });

    if (!userEvent) {
      userEvent = new UserEvent({ user: userId, event: eventId });
    }

    // Verifică dacă a ajuns la maxClaims
    if (userEvent.totalClaims >= event.maxClaims) {
      return res.status(400).json({ message: "Max claims reached" });
    }

    // Verifică cooldown (24h între claims)
    if (userEvent.lastClaimDate) {
      const nextAvailable = new Date(userEvent.lastClaimDate);
      nextAvailable.setHours(nextAvailable.getHours() + event.claimCooldownHours);

      if (new Date() < nextAvailable) {
        const now = new Date();
        const diffMs = nextAvailable - now; // diferența în milisecunde
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return res.status(400).json({ message: "You can claim again in ",hours: diffHours,
        minutes: diffMinutes, });
      }
    }

    // Determină ce reward primește acum
    const claimIndex = userEvent.totalClaims; // 0 -> primul, 1 -> al doilea, etc.
    let reward = {};
    if (claimIndex === 0) reward = { cash: 10 };
    if (claimIndex === 1) reward = { cash: 50 };
    if (claimIndex === 2) reward = { cash: 200 };

    // Adaugă reward-ul în UserEvent
    userEvent.claims.push({ reward, date: new Date() });
    userEvent.totalClaims += 1;
    userEvent.lastClaimDate = new Date();
    await userEvent.save();

    // Aplică reward-ul și în User
    await User.findByIdAndUpdate(userId, {
      $inc: {
        cash: reward.cash || 0,
        coins: reward.coins || 0,
        trainingPoints: reward.trainingPoints || 0,
      },
    });

    res.json({
      message: "Reward claimed!",
      reward,
      totalClaims: userEvent.totalClaims,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/progress", async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id; // presupunem că auth middleware pune user-ul în req.user

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // caută progresul utilizatorului
    let userEvent = await UserEvent.findOne({ user: userId, event: eventId });

    let totalClaims = 0;
    let cooldownUntil = null;

    if (userEvent) {
      totalClaims = userEvent.totalClaims;

      // dacă a mai colectat cel puțin o dată
      if (userEvent.lastClaimDate) {
        cooldownUntil = new Date(userEvent.lastClaimDate);
        cooldownUntil.setHours(cooldownUntil.getHours() + event.claimCooldownHours);
      }
    }

    res.json({
      event,
      userClaims: totalClaims,
      cooldownUntil,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // verificăm progresul utilizatorului
    let userEvent = await UserEvent.findOne({
      user: req.user.id,
      event: event._id,
    });

    event.cooldownUntil=userEvent?.influenceActiveUntil;
    console.log(event)
    res.json({
      ...event.toObject(),
      userProgress: userEvent ? userEvent.totalClaims : 0,
      influenceActiveUntil: userEvent?.influenceActiveUntil,

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/activate-influence", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.type !== "double_influence")
      return res.status(400).json({ message: "Not a double influence event" });

    const now = new Date();
    let userEvent = await UserEvent.findOne({ user: req.user.id, event: event._id });

    if (!userEvent) {
      userEvent = new UserEvent({ user: req.user.id, event: event._id });
    }

    // verificăm dacă efectul este deja activ
    if (userEvent.influenceActiveUntil && userEvent.influenceActiveUntil > now) {
      return res.status(400).json({
        message: "Effect already active",
        effectEnd: userEvent.influenceActiveUntil,
      });
    }

    // setăm durata efectului (ex: 3 ore)
    const durationHours = 3;
    const effectEnd = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    userEvent.influenceActiveUntil = effectEnd;
    await userEvent.save();

    res.json({
      message: "Double influence activated!",
      effectEnd,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
