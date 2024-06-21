// backend/controllers/roomController.js
const Room = require('../models/Room');
const Frame = require('../models/Frame');
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

exports.createRoom = async (req, res) => {   
  const { type, creator } = req.body;   
  const newRoom = new Room({ type, creator, frames: [] });   
  await newRoom.save();   
  res.json({ room: newRoom });
 };

 exports.addFrameToRoom = async (req, res) => {
  // Assuming roomId and the image data are sent in the request body
  const { roomId, base64Data, createdBy } = req.body; 

  if (!roomId || !base64Data) {
    return res.status(400).send('Missing roomId or image data');
  }

  const params = {
    Bucket: 'animak',
    Key: `${Date.now()}_${roomId}.png`,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `image/png`
  };

  try {
    const s3UploadRes = await uploadToS3(params);
    const s3Url = s3UploadRes.Location;

    await Room.updateOne(
      { _id: roomId },
      { $push: { frames: { s3Url, createdBy } } }
    );
  
    res.json({ message: 'Upload successful', data: s3UploadRes });
    
  } catch (err) {
    return res.status(500).send('Error uploading to S3');
  }
};

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



