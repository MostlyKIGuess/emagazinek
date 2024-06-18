// backend/controllers/roomController.js
const Room = require('../models/Room');
const Frame = require('../models/Frame');
const s3 = require('../config/s3');
const multer = require('multer');

const { exec} = require('child_process');
const path = require('path');
const fs = require('fs');

const upload = multer({storage: multer.memoryStorage()});

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


function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

exports.addFrame = async (req, res) => {
  const { roomId, createdBy } = req.body;

  if (!isValidObjectId(roomId)) {
    return res.status(400).json({ error: "Invalid roomId" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No frame uploaded" });
  }

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}_${roomId}.png`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype, // Use the file's mimetype
      ACL: 'public-read',
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Error uploading to S3" });
      }
      
      const frame = new Frame({ roomId, s3Url: data.Location, createdBy });
      await frame.save();
      // console.log(frame);
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      room.frames.push(frame._id);
      await room.save();

      res.status(201).json({ frame });
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred while adding the frame" });
  }
};



exports.mergeFramesToVideo = async (req, res) => {
  const { roomId } = req.body;
  console.log("IS THIS WORKING BRO???")
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const frames = room.frames.map(frame => frame.s3Url);
    const tempDir = path.join(__dirname, 'temp', roomId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download frames from S3 to temp directory
    for (let i = 0; i < frames.length; i++) {
      const frameUrl = frames[i];
      const fileName = `${i + 1}.png`; // Naming files as 1.png, 2.png, ...
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
};