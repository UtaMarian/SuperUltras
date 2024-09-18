const express = require("express");
const Country = require('../models/Country');
const router = express.Router();

// GET all countries
router.get('/', async (req, res) => {
    try {
      const countries = await Country.find();
      res.json(countries);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // GET a single country by ID
  router.get('/:id', async (req, res) => {
    try {
      const country = await Country.findById(req.params.id);
      if (!country) return res.status(404).json({ message: 'Country not found' });
      res.json(country);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // CREATE a new country
  router.post('/', async (req, res) => {
    const { name, abbreviation } = req.body;

    // Validations
    if (name.length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }
    if (abbreviation.length !== 3) {
      return res.status(400).json({ message: 'Abbreviation must be exactly 3 characters long' });
    }
  
    const country = new Country({
      name,
      abbreviation,
    });
  
    try {
      const newCountry = await country.save();
      res.status(201).json(newCountry);
    } catch (err) {
      if (err.code === 11000) { // Check for duplicate key error
        console.log(err);
        return res.status(400).json({ message: 'Country name or abbreviation already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // UPDATE a country
  router.put('/:id', async (req, res) => {
    const { name, abbreviation } = req.body;
  
    try {
      const country = await Country.findById(req.params.id);
      if (!country) return res.status(404).json({ message: 'Country not found' });
  
      // Update fields with validation
      if (name) {
        if (name.length < 3) {
          return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }
        country.name = name;
      }
  
      if (abbreviation) {
        if (abbreviation.length !== 3) {
          return res.status(400).json({ message: 'Abbreviation must be exactly 3 characters long' });
        }
        country.abbreviation = abbreviation;
      }
  
      const updatedCountry = await country.save();
      res.json(updatedCountry);
    } catch (err) {
      if (err.code === 11000) { // Check for duplicate key error
        return res.status(400).json({ message: 'Country name or abbreviation already exists' });
      }
      res.status(400).json({ message: err.message });
    }
  });
  
  // DELETE a country
  router.delete('/:id', async (req, res) => {
    try {
        const result = await Country.deleteOne({ _id: req.params.id });

        // Check if the deletion was successful
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Country not found' });
        }

        res.json({ message: 'Country deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;