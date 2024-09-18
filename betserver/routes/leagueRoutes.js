const express = require("express");
const League = require('../models/League');
const router = express.Router();

// GET all leagues
router.get('/', async (req, res) => {
    try {
      const leagues = await League.find();
      res.json(leagues);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // GET a single league by ID
  router.get('/:id', async (req, res) => {
    try {
      const league = await League.findById(req.params.id);
      if (!league) return res.status(404).json({ message: 'League not found' });
      res.json(league);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // CREATE a new league
  router.post('/', async (req, res) => {
    const { name, no_teams, is_active } = req.body;
  
    // Validation
    if (name.length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }
  
    const league = new League({
      name,
      no_teams,
      is_active,
    });
  
    try {
      const newLeague = await league.save();
      res.status(201).json(newLeague);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'League name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // UPDATE a league
  router.put('/:id', async (req, res) => {
    const { name, no_teams, is_active } = req.body;
  
    try {
      const league = await League.findById(req.params.id);
      if (!league) return res.status(404).json({ message: 'League not found' });
  
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }
        league.name = name;
      }
  
      if (typeof no_teams === 'number') {
        league.no_teams = no_teams;
      }
  
      if (typeof is_active === 'boolean') {
        league.is_active = is_active;
      }
  
      const updatedLeague = await league.save();
      res.json(updatedLeague);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'League name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a league
  router.delete('/:id', async (req, res) => {
    try {
      const result = await League.deleteOne({ _id: req.params.id });

      // Check if the deletion was successful
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'League not found' });
      }

      res.json({ message: 'League deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;