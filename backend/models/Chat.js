// backend/models/Chat.js
const mongoose = require('mongoose');

const frameSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  messagee : String,
  createdBy: String,
});

module.exports = mongoose.model('Chat', frameSchema);