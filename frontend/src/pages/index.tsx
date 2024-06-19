// src/app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router'; 
import axios from 'axios';
import "../app/globals.css"
import { Analytics } from '@vercel/analytics/react';

export default function Homes() {
  const [type, setType] = useState('');
  const [creator, setCreator] = useState('');
  const router = useRouter(); 

  const createRoom = async () => {
    const response = await axios.post('https://emagazinek.onrender.com/api/rooms', { type, creator });
    const roomId = response.data.room._id;
    router.push(`/create/${roomId}`); 
  };

  return (
    <div className="bg-gradient-to-r from-cream-light to-cream-dark min-h-screen flex items-center justify-center">
      <div className="bg-white/80 rounded-lg p-8 sshadow-lg space-y-4">
        <h1 className="text-4xl font-bold text-center">Create a Room</h1>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="select select-bordered w-full text-black p-2"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <input
          type="text"
          placeholder="Creator"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="input input-bordered w-full text-black p-2"
        />
        <button
          onClick={createRoom}
          className="btn btn-primary w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >Create</button>
      </div>
      <Analytics/>
    </div>
  );
}