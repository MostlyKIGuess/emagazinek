// backend/models/Room.js
const mongoose = require('mongoose');
const frameSchema = require('./Frame').schema;


const roomSchema = new mongoose.Schema({
  key: String,
  type: String,
  frames: [frameSchema], // Adjusted to use a subdocument array
  creator: String,
  participants: [String],
});

module.exports = mongoose.model('Room', roomSchema);