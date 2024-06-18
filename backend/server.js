
//backend/server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
require('dotenv').config();

const s3 = require('./config/awsConfig');


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
  const { roomId, s3Url, createdBy } = req.body;
  const room = await Room.findById(roomId);
  // console.log(room)
  if (room) {
    room.frames.push({ s3Url, createdBy });
    await room.save();
    res.json({ message: 'Frame saved' });
    console.log("Frame saved")
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// const roomController = require('./controllers/roomController');

app.get('/api/rooms/merge-frames', async (req, res) => {
  const { roomId } = req.query;
  // console.log(roomId)
  // console.log("IS THIS WORKING BRO???") yes cutie this is working now
  try {
    const room = await Room.findById(roomId);
    // console.log(room)
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const frames = room.frames.map(frame => frame.s3Url);
    // console.log(frames)
    const tempDir = path.join(__dirname, 'temp', roomId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download frames from S3 to temp directorsy
    for (let i = 0; i < frames.length; i++) {
      const frameUrl = frames[i];
      const fileName = `${i + 1}.png`; 
      const filePath = path.join(tempDir, fileName);

      const { Bucket, Key } = s3.getSignedUrl('getObject', { Bucket: 'YOUR_BUCKET_NAME', Key: frameUrl });
      const fileStream = fs.createWriteStream(filePath);
      s3.getObject({ Bucket, Key }).createReadStream().pipe(fileStream);
    }

    // Ensure all frames are downloaded before proceeding
    fileStream.on('close', () => {
      const outputVideoPath = path.join(tempDir, 'output.mp4');
      const ffmpegCommand = `ffmpeg -framerate 24 -i ${tempDir}/%d.png -c:v libx264 -pix_fmt yuv420p ${outputVideoPath}`;

      exec(ffmpegCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ message: 'Error creating video' });
        }

        // Upload the video to S3
        const videoStream = fs.createReadStream(outputVideoPath);
        const uploadParams = {
          Bucket: 'YOUR_BUCKET_NAME',
          Key: `path/to/videos/${roomId}/output.mp4`,
          Body: videoStream,
          ACL: 'public-read' // if you want the video to be publicly accessible
        };

        s3.upload(uploadParams, function(s3Err, data) {
          if (s3Err) {
            console.error(`Upload error: ${s3Err}`);
            return res.status(500).json({ message: 'Error uploading video' });
          }

          // Respond with the URL of the uploaded video
          res.json({ message: 'Video created successfully', videoUrl: data.Location });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
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



