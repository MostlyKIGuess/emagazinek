// src/app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Home() {
  const [type, setType] = useState('');
  const [creator, setCreator] = useState('');
  const router = useRouter(); // bull shit 

  const createRoom = async () => {
    const response = await axios.post('http://localhost:4000/api/rooms', { type, creator });
    const roomId = response.data.room._id;
    router.push(`/create/${roomId}`);
  };

  return (
    <div>
      <h1>Create a Room</h1>
      <input
        type="text"
        placeholder="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
      />
      <input
        type="text"
        placeholder="Creator"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
}