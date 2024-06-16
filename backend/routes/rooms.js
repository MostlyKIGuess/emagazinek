// backend/routes/rooms.js
const express = require('express');
const { createRoom, getRoom, addFrame } = require('../controllers/roomController');

const router = express.Router();

router.post('/', createRoom);
router.get('/:roomId', getRoom);
router.post('/frames', addFrame);

module.exports = router;
