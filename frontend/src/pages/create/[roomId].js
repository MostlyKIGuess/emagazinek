// frontend/pages/create/[roomId].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Canvas from '../../components/canvas';
import axios from 'axios';

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState(null);

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
    await axios.post('http://localhost:4000/api/rooms/frames', {
      roomId,
      data: dataURL,
      createdBy: 'username', // Replace with actual username
    });
  };

  const handleMergeFrames = async () => {
    await axios.get(`http://localhost:4000/api/rooms/merge-frames?roomId=${roomId}`)
      .then(response => alert('Frames merged successfully!'))
      .catch(error => alert('Error merging frames: ' + error.message));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-8 m-4 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4">Room: {roomId}</h1>
        <div className="mb-4">
          <Canvas socket={socket} roomId={roomId} />
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
      </div>
    </div>
  );
};

export default Room;