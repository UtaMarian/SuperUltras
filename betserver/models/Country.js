const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CountrySchema = new Schema({
    name: {type: String, required: true, min: 3, unique: true},
    abbreviation : {type: String, required: true, min: 3,max:3, unique: true},
  });

const CountryModel = model('Country', CountrySchema);

module.exports = CountryModel;