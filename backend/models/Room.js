// backend/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  key: String,
  type: String,
  frames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Frame' }],
  creator: String,
  participants: [String],
});

module.exports = mongoose.model('Room', roomSchema);
