// socket.js
import { Server } from 'socket.io';
import authenticate from '../src/middleweare/socketmiddleware.js';
import { notificationHandler } from './socket.handler.js';

let io; // shared socket instance

export const initSocket = (httpServer) => {
  console.log("🔥 initSocket called");

  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(authenticate);

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected (Socket ${socket.id})`);

    // Handle events
    notificationHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected`);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    console.error("❌ getIO called before initSocket!");
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
