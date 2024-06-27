const Chat = require('../models/Chat');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on('draw', (data) => {
      io.to(data.roomId).emit('draw', data);
      socket.broadcast.to(data.roomId).emit('draw', data);
    });

    socket.on('sendChatMessage', async ({ roomId, message, createdBy }) => {
      try {
        const newMessage = await Chat.create({ roomId, message, createdBy });
        io.to(roomId).emit('newChatMessage', newMessage); 
        // socket.broadcast.to(roomId).emit('newChatMessage', newMessage);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('updateFrameCount', async ({ roomId, frameCount }) => {
      try {
        console.log('frameCount', frameCount);
        io.to(roomId).emit('updateFrameCount', frameCount);
      } catch (error) {
        console.error(error);
      }
    })

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
}

module.exports = setupSocket;