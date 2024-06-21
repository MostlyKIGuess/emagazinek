// src/pages/index.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import "../app/globals.css"
import { Analytics } from '@vercel/analytics/react';

export default function Homes() {
  const [type, setType] = useState('create'); 
  const [creator, setCreator] = useState('');
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const handleAction = async () => {
    if (type === 'create') {
      const response = await axios.post('https://emagazinek.onrender.com/api/rooms', { creator });
      const newRoomId = response.data.room._id;
      router.push(`/create/${newRoomId}`);
    } else if (type === 'join') {
      try {
    
        const response = await axios.get(`https://emagazinek.onrender.com/api/rooms/frames/${roomId}`);
        if (response.status === 200 && response.data) {
          
          router.push(`/join/${roomId}`);
        } else {
          
          console.error('Room not found or access denied');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error('Room not found:', error.message);
        } else {
          console.error('Error fetching room:', error);
        }
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-cream-light to-cream-dark min-h-screen flex items-center justify-center">
      <div className="bg-white/80 rounded-lg p-8 shadow-lg space-y-4">
        <h1 className="text-4xl font-bold text-center">Room Action</h1>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="select select-bordered w-full text-black p-2"
        >
          <option value="create">Create Room</option>
          <option value="join">Join Room</option>
        </select>
        {type === 'create' && (
          <input
            type="text"
            placeholder="Creator"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            className="input input-bordered w-full text-black p-2"
          />
        )}
        {type === 'join' && (
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="input input-bordered w-full text-black p-2"
          />
        )}
        <button
          onClick={handleAction}
          className="btn btn-primary w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >{type === 'create' ? 'Create' : 'Join'}</button>
      </div>
      <Analytics/>
    </div>
  );
}