const express = require('express');
const router = express.Router();
const UltrasLeague = require('../models/ultras/UltrasLeague');

// Create a new UltrasLeague
router.post('/leagues', async (req, res) => {
    try {
        const league = new UltrasLeague({
            name: req.body.name,
            country: req.body.country
        });
        await league.save();
        res.status(201).json(league);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all UltrasLeagues
router.get('/leagues', async (req, res) => {
    try {
        const leagues = await UltrasLeague.find().populate('country').populate('seasons');
        res.status(200).json(leagues);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get a single UltrasLeague by ID
router.get('/leagues/:id', async (req, res) => {
    try {
        const league = await UltrasLeague.findById(req.params.id).populate('country').populate('seasons');
        if (!league) {
            return res.status(404).json({ error: "League not found" });
        }
        res.status(200).json(league);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing UltrasLeague by ID
router.put('/leagues/:id', async (req, res) => {
    try {
        const league = await UltrasLeague.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, country: req.body.country },
            { new: true, runValidators: true }
        );
        if (!league) {
            return res.status(404).json({ error: "League not found" });
        }
        res.status(200).json(league);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete an UltrasLeague by ID
router.delete('/leagues/:id', async (req, res) => {
    try {
        const league = await UltrasLeague.findById(req.params.id);
        if (!league) {
            return res.status(404).json({ error: "League not found" });
        }
        await UltrasLeague.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "League deleted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
