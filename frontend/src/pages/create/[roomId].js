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
      createdBy: 'username', // Replace with the actual username
    });
  };

  return (
    <div>
      <Canvas socket={socket} roomId={roomId} />
      <button onClick={handleSaveFrame}>Save Frame</button>
    </div>
  );
};

export default Room;
