import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String, required: true },       // UUID
  deviceType: String,                               // "Chrome on macOS"
  ip: String,
  location: String,
  userAgent: String,
  jwtToken: String,                                 // store hashed token or unique sessionId
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
expiresIn: { type: Number } // optional, in minutes                       // optional
});

export const Session = mongoose.model("Session", sessionSchema);
