import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Canvas from '../../components/canvas';

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState(null);
  const [videoDuration, setVideoDuration] = useState('1'); // Default to 1 second
  const [videoUrl, setVideoUrl] = useState('');
  const [frameCount, setFrameCount] = useState(0); // New state for frame count

  useEffect(() => {
    if (roomId) {
      const socketInstance = io('http://localhost:4000');
      setSocket(socketInstance);
      socketInstance.emit('joinRoom', roomId);
      return () => socketInstance.disconnect();
    }
  }, [roomId]);

  const handleSaveFrame = async () => {
    const dataURL = document.querySelector('canvas').toDataURL();
    const base64Data = dataURL.split(':')[1];
    await axios.post('http://localhost:4000/api/rooms/frames', {
      roomId,
      base64Data: base64Data, 
      createdBy: 'username', // Replace with actual username
    });
    setFrameCount(frameCount + 1);
  };

  const handleMergeFrames = async () => {
    const duration = videoDuration || '1'; 
    await axios.get(`http://localhost:4000/api/rooms/merge-frames?roomId=${roomId}&videoLengthInSeconds=${duration}`)
      .then(response => {
        alert('Frames merged successfully!');
        setVideoUrl(`http://localhost:4000${response.data.videoUrl}`);
        console.log(response.data.videoUrl);
      })
      .catch(error => alert('Error merging frames: ' + error.message));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-8 m-4 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-black">Room: {roomId}</h1>
        <div className="mb-5">
          <Canvas socket={socket} roomId={roomId} />
          <input
            type="text"
            value={videoDuration}
            onChange={(e) => setVideoDuration(e.target.value)}
            placeholder="Enter video duration in seconds"
            className="input duration-input text-black mt-2 w-full px-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex justify-center space-x-4">
        <div className="frame-counter mt-2 text-black ">
          <p>Frame Count: {frameCount}</p>
        </div>

          <button
            onClick={handleSaveFrame}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Frame
          </button>
          <button
            onClick={handleMergeFrames}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Merge Frames
          </button>
        </div>
        {videoUrl && (
          <div className="video-container mt-10">
            <video controls>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
       
      </div>
    </div>
  );
};

export default Room;