const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(bodyParser.json());

const Room = require('./models/Room');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.post('/api/rooms', async (req, res) => {
  const { type, creator } = req.body;
  const newRoom = new Room({ type, creator, frames: [] });
  await newRoom.save();
  res.json({ room: newRoom });
});

app.post('/api/rooms/frames', async (req, res) => {
  const { roomId, data, createdBy } = req.body;
  const room = await Room.findById(roomId);
  if (room) {
    room.frames.push({ data, createdBy });
    await room.save();
    res.json({ message: 'Frame saved' });
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('draw', (data) => {
    io.to(data.roomId).emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
