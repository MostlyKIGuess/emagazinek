// backend/models/Room.js
const mongoose = require('mongoose');
const frameSchema = require('./Frame').schema;
const chatSchema = require('./Chat').schema;

const roomSchema = new mongoose.Schema({
  key: String,
  type: String,
  frames: [frameSchema], 
  roomChats: [chatSchema],
  creator: String,
  participants: [String],
});

module.exports = mongoose.model('Room', roomSchema);