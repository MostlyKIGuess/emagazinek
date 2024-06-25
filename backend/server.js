
//backend/server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// const s3 = require('./config/awsConfig');


const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");


const s3Client = new S3Client({

  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


async function uploadToS3(params) {
  try {
    const { ACL, ...uploadParams } = params;

    const upload = new Upload({
      client: s3Client,
      params: uploadParams //  exclude ACL
    });

    const result = await upload.done();
    console.log('Upload success:', result);
    return result;
  } catch (err) {
    console.error('Upload error:', err);
    throw err; 
  }
}

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




io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('draw', (data) => {
    io.to(data.roomId).emit('draw', data);
    socket.broadcast.to(data.roomId).emit('draw', data);
  });

  socket.on('sendChatMessage', async ({ roomId, message, createdBy }) => {
    try {
      const newMessage = await Chat.create({ roomId, message, createdBy });
      io.to(roomId).emit('newChatMessage', newMessage); 
      socket.broadcast.to(roomId).emit('newChatMessage', newMessage);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});



app.get('/api/rooms/frames/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    res.json(room.frames); 
  } catch (error) {
    res.status(500).send('Error fetching frames');
  }
});




const { createRoom, addFrameToRoom } = require('./controllers/roomController');
 app.post('/api/rooms', createRoom);
app.post('/api/rooms/frames', addFrameToRoom);


// things i need for merging 
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function getSignedUrlForGetObject(Bucket, Key) {
  try {
    const command = new GetObjectCommand({ Bucket, Key });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL", error);
    throw error;
  }
}



// for merging needs
const axios = require('axios');
const { exec } = require('child_process');

app.use(express.static('public'));


app.get('/api/rooms/merge-frames', async (req, res) => {
  const { roomId, videoLengthInSeconds } = req.query; // Accept videoLengthInSeconds parameter

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const frames = room.frames.map(frame => frame.s3Url);
    if (frames.length === 0) {
      return res.status(400).json({ message: 'No frames to merge' });
    }

    // Ensure videoLengthInSeconds is a positive number
    const videoLength = Number(videoLengthInSeconds);
    if (isNaN(videoLength) || videoLength <= 0) {
      return res.status(400).json({ message: 'Invalid video length' });
    }

    const tempDir = path.join(__dirname, 'temp', roomId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

  
for (let i = 0; i < frames.length; i++) {
  const frameUrl = frames[i];
  const fileName = `${i + 1}.png`;
  const filePath = path.join(tempDir, fileName);
  // console.log(frameUrl, fileName, filePath);

  const command = new GetObjectCommand({
    Bucket: 'animak',
    Key: decodeURIComponent(new URL(frameUrl).pathname.substring(1)), 
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const response = await axios({ method: 'get', url: signedUrl, responseType: 'text' }); // because it is a ascii data we need text
  const base64Data = response.data.split(';base64,').pop(); // gets us the base64 string
  const buffer = Buffer.from(base64Data, 'base64'); 

  fs.writeFileSync(filePath, buffer); // Write the binary data to a PNG file

  
}
    
const frameRate = frames.length / videoLength;
const videosDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const outputVideoPath = path.join(__dirname, 'public', 'videos', `${roomId}_${frames.length}` + '.mp4');
// Use the calculated frame rate in the ffmpeg command
const ffmpegCommand = `ffmpeg -framerate ${frameRate} -i ${tempDir}/%d.png -c:v libx264 -pix_fmt yuv420p ${outputVideoPath}`;

exec(ffmpegCommand, async (error) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return res.status(500).json({ message: 'Error creating video' });
  }

  res.json({ message: 'Video created successfully', videoUrl: `/videos/${roomId}_${frames.length}.mp4` });
});
} catch (error) {
console.error(error);
res.status(500).json({ message: 'An error occurred' });
}
});



