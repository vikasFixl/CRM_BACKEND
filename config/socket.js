// socket.js
import { Server } from 'socket.io';
import authenticate from '../src/middleweare/socketmiddleware.js';
import { notificationHandler } from './socket.handler.js';
import logger from './logger.js';

let io; // shared socket instance

export const initSocket = (httpServer) => {
  logger.info(" initSocket called");

  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(authenticate);

  io.on('connection', (socket) => {
    logger.info(`✅ User ${socket.userId} connected (Socket ${socket.id})`);

    // Handle events
    notificationHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`❌ User ${socket.userId} disconnected`);
    });
  });

  logger.info("✅ Socket.IO initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    logger.error("❌ getIO called before initSocket!");
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
