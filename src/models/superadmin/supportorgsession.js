import mongoose from "mongoose";
const supportOrgSessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true }, // hash of JWT
  supportorgtoken: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
});

export const SupportOrgSession = mongoose.model('SupportOrgSession', supportOrgSessionSchema);