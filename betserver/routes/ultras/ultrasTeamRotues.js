const express = require("express");
const Team = require('../models/Team');
const League = require('../models/League');
const Country = require('../models/Country');
const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'teamslogo/' });
const fs = require('fs');

// GET all teams
router.get('/', async (req, res) => {
    try {
      const teams = await Team.find()
        .populate('fromLeague', 'name is_active')
        .populate('fromCountry', 'name abbreviation');
      res.json(teams);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // GET a single team by ID
  router.get('/:id', async (req, res) => {
    try {
      const team = await Team.findById(req.params.id)
        .populate('fromLeague', 'name is_active')
        .populate('fromCountry', 'name abbreviation');
      if (!team) return res.status(404).json({ message: 'Team not found' });
      res.json(team);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // CREATE a new team
  router.post('/', uploadMiddleware.single('file'),async (req, res) => {
    
    const {originalname,path} = req.file;
    const { name, fromLeague, fromCountry } = req.body;
  
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    // Validation
    if (name.length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }
  
    try {
      // Check if League exists
      const leagueExists = await League.findById(fromLeague);
      if (!leagueExists) return res.status(400).json({ message: 'League not found' });
  
      // Check if Country exists
      const countryExists = await Country.findById(fromCountry);
      if (!countryExists) return res.status(400).json({ message: 'Country not found' });
  
      const team = new Team({
        name,
        fromLeague,
        fromCountry,
        imageUrl:newPath,
      });
  
      const newTeam = await team.save();
      res.status(201).json(newTeam);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'Team name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // UPDATE a team
  router.put('/:id', async (req, res) => {
    const { name, fromLeague, fromCountry } = req.body;
  
    try {
      const team = await Team.findById(req.params.id);
      if (!team) return res.status(404).json({ message: 'Team not found' });
  
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }
        team.name = name;
      }
  
      if (fromLeague) {
        // Check if League exists
        const leagueExists = await League.findById(fromLeague);
        if (!leagueExists) return res.status(400).json({ message: 'League not found' });
        team.fromLeague = fromLeague;
      }
  
      if (fromCountry) {
        // Check if Country exists
        const countryExists = await Country.findById(fromCountry);
        if (!countryExists) return res.status(400).json({ message: 'Country not found' });
        team.fromCountry = fromCountry;
      }
  
      const updatedTeam = await team.save();
      res.json(updatedTeam);
    } catch (err) {
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'Team name already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a team
  router.delete('/:id', async (req, res) => {
    try {
      //TODO delete all bets that implicate this team

      
      const result = await Team.deleteOne({ _id: req.params.id });

      // Check if the deletion was successful
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Team not found' });
      }


    
      res.json({ message: 'Team deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  module.exports = router;