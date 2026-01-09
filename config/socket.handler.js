// Do NOT pass `io` anymore. Always use getIO internally
import logger from "./logger.js";
import { getIO } from "./socket.js";

export const notificationHandler = (io, socket) => {
    socket.on("notification_read", (notificationId) => {
        logger.info(`User ${socket.userId} read notification ${notificationId}`);
        // Add DB logic if needed
    });

    // Add more handlers as needed
};

export const sendToUser = (userId, notification) => {
    const io = getIO(); // ✅ Ensure io is initialized
    if (!io) {
        logger.error("❌ Socket.io is not initialized.");
        return;
    }

    logger.info("➡️ Sending to:", `user_${userId}`, notification);
    io.to(`user_${userId}`).emit("new_notification", {
        ...notification,
        timestamp: new Date(),
    });
};

export const sendToMultipleUsers = (userIds, notification) => {
    const io = getIO(); // ✅ Safe fallback
    if (!io) {
        logger.error("❌ Socket.io is not initialized.");
        return;
    }

    userIds.forEach((userId) => {
        io.to(`user_${userId}`).emit("new_notification", {
            ...notification,
            timestamp: new Date(),
        });
    });
};
