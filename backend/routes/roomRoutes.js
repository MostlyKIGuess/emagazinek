const express = require('express');
const router = express.Router();
const { createRoom, addFrameToRoom, addChatMessageToRoom, fetchFrames, fetchChats } = require('../controllers/roomController');

router.post('/', createRoom);
router.post('/frames', addFrameToRoom);
router.post('/chat', addChatMessageToRoom);
router.get('/frames/:roomId', fetchFrames);
router.get('/chat/:roomId', fetchChats);

module.exports = router;