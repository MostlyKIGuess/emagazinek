// src/app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router'; 
import axios from 'axios';

export default function Homes() {
  const [type, setType] = useState('');
  const [creator, setCreator] = useState('');
  const router = useRouter(); 

  const createRoom = async () => {
    const response = await axios.post('http://localhost:4000/api/rooms', { type, creator });
    const roomId = response.data.room._id;
    router.push(`/create/${roomId}`); 
  };

  return (
    <div className="bg-gradient-to-r from-cream-light to-cream-dark min-h-screen flex items-center justify-center">
      <div className="bg-white/80 rounded-lg p-8 sshadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center">Create a Room</h1>
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Creator"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="input input-bordered w-full"
        />
        <button
          onClick={createRoom}
          className="btn btn-primary w-full"
        >Create</button>
      </div>
    </div>
  );
}