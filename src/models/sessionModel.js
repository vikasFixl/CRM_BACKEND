import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  deviceId: {
    type: String,
    required: true, // Should be UUID generated on the client
  },

  deviceType: {
    type: String, // E.g., "Chrome on Windows", "Safari on iPhone"
  },

  ip: {
    type: String,
  },

  location: {
    type: String, // Optional - can be fetched via geoip lookup on backend
  },

  userAgent: {
    type: String,
  },

  jwtToken: {
    type: String, // You can store hashed token for security
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    required: true,
     index: { expires: 0 }
  },

  expiresIn: {
    type: Number, // optional: store token expiry duration in minutes
  }
});

export const Session = mongoose.model("Session", sessionSchema);
