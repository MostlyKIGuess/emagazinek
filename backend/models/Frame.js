// backend/models/Frame.js
const mongoose = require('mongoose');

const frameSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  data: String,
  createdBy: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Frame', frameSchema);
