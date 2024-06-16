// backend/controllers/roomController.js
const Room = require('../models/Room');
const Frame = require('../models/Frame');

exports.createRoom = async (req, res) => {
  const { type, creator } = req.body;
  const key = generateRoomKey();

  const room = new Room({ key, type, creator, participants: [creator] });
  await room.save();

  res.status(201).json({ room });
};

exports.getRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId).populate('frames');
  res.status(200).json({ room });
};

exports.addFrame = async (req, res) => {
  const { roomId, data, createdBy } = req.body;
  const frame = new Frame({ roomId, data, createdBy });
  await frame.save();

  const room = await Room.findById(roomId);
  room.frames.push(frame);
  await room.save();

  res.status(201).json({ frame });
};

function generateRoomKey() {
  return Math.random().toString(36).substr(2, 9);
}
