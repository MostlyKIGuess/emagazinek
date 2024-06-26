// backend/models/Chat.js
const mongoose = require('mongoose');

const frameSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  message : String,
  createdBy: String,
});

module.exports = mongoose.model('Chat', frameSchema);