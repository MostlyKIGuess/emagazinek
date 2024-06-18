// frontend/pages/create/[roomId].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Canvas from '../../components/canvas';

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState(null);
  const [videoDuration, setVideoDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

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
    // console.log(dataURL)
    await axios.post('http://localhost:4000/api/rooms/frames', {
      roomId,
      base64Data: base64Data, 
      createdBy: 'username', // Replace with actual username
    });
  };

   const handleMergeFrames = async () => {
    await axios.get(`http://localhost:4000/api/rooms/merge-frames?roomId=${roomId}&videoLengthInSeconds=${videoDuration}`)
      .then(response => {
        alert('Frames merged successfully!');
        setVideoUrl(`http://localhost:4000${response.data.videoUrl}`); // Update this line
        console.log(response.data.videoUrl);
      })
      .catch(error => alert('Error merging frames: ' + error.message));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-8 m-4 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4">Room: {roomId}</h1>
        <div className="mb-4">
          <Canvas socket={socket} roomId={roomId} />
          <input
            type="text"
            value={videoDuration}
            onChange={(e) => setVideoDuration(e.target.value)}
            placeholder="Enter video duration in seconds"
            className="input duration-input"
          />
        </div>
        <div className="flex justify-center space-x-4">
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
          <div className="video-container">
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