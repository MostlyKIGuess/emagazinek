// src/pages/index.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import "../app/globals.css"
import { Analytics } from '@vercel/analytics/react';
import { Container, Typography, TextField, Button, Select, MenuItem, Box } from '@mui/material';
import '@fontsource/permanent-marker'; 
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import GridPattern from '@/components/ui/animated-grid-pattern';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "emagazinek",
  description: "An app to make flip book with gen AI for inspiration.",
};


export default function Homes() {
  const [type, setType] = useState('create'); 
  const [creator, setCreator] = useState('');
  const [roomId, setRoomId] = useState(''); 
  const [username, setUsername] = useState('undefined');
  const [creatingRoom, setCreatingRoom] = useState(false);


  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleAction = async () => {
    if (creatingRoom) {
      return;
    }
    setCreatingRoom(true);
    if (type === 'create') {
      const response = await axios.post(`${API_URL}/api/rooms`, { creator : username });
      const newRoomId = response.data.room._id;
      router.push(`/create/${newRoomId}?username=${creator}`);
    } else if (type === 'join') {
      try {
        const response = await axios.get(`${API_URL}/api/rooms/frames/${roomId}`,{params: { username }});
        if (response.status === 200 && response.data) {
          router.push(`/join/${roomId}?username=${username}`);
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
  <div>
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        // padding: 4, 
      }}
    >
       <Typography
        variant="h5"
        component="h2"
        gutterBottom
        align="center"
        sx={{
          color: 'black',
          marginBottom: 4,
          maxWidth: 600,
          fontFamily: "Times New Roman", 
        }}
      >
        Welcome to <span style={{ color: '#ff1f89' }}>emagazineK!</span> Here, you can chat with friends and create flip book animations together. Start your room now and bring your ideas to life!
        {/* Welcome to <span style={{ color: '#ff1f89' }}>emagazineK</span>, a place where people can collaborate with their friends and make flip book animation while chatting. Please make a room to start. */}
      </Typography>

      <Container maxWidth="sm" sx={{ background: '#ececec', padding: 4, borderRadius: 2, boxShadow: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color='textPrimary'>
          Room Action
        </Typography>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          variant="outlined"
          sx={{ marginBottom: 2 }}
        >
          <MenuItem value="create">Create Room</MenuItem>
          <MenuItem value="join">Join Room</MenuItem>
        </Select>
        {creatingRoom && (
          <Typography variant="h6" sx={{ color: 'black', textAlign: 'center', marginBottom: 2 }}>
            {type === 'create' ? 'Creating room...' : 'Joining room...'}
          </Typography>
        )}
        {type === 'create' && (
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            margin="normal"
          />
        )}
        {type === 'join' && (
          <>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Room ID"
              variant="outlined"
              fullWidth
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              margin="normal"
            />
          </>
        )}
        <Button
          onClick={handleAction}
          variant="contained"
          fullWidth
          sx={{ marginTop: 2, backgroundColor: '#b13965', '&:hover': { backgroundColor: '#9b3259' } }}
        >
          {type === 'create' ? 'Create' : 'Join'}
        </Button>
      </Container>

    </Box>
    <GridPattern
     />

    </div>
  );
}