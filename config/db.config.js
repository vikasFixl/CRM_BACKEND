import mongoose from "mongoose";
import dotenv from "dotenv";

// dotenv.config({ path: "../../.env" }); /// use while seedeing 
dotenv.config();
logger.info(process.env.Mongo_URI);

import logger from './logger.js';

const cached = (global.mongoose = global.mongoose || { conn: null, promise: null });
const uri=process.env.MONGO_URI;
export async function connectDB() {
  if (cached.conn) return cached.conn;

  
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
      })
      .then((m) => {
        logger.info('MongoDB connected successfully');
        if (process.env.MONGOOSE_DEBUG  === 'true') mongoose.set('debug', logger.debug.bind(logger));
        m.connection.on('error', (e) => logger.error('MongoDB error:', e));
        m.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        logger.error('MongoDB connection failed:', err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}