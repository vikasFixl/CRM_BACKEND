import mongoose, { Schema } from "mongoose";



const OrganizationInviteSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: "Organization" ,required: true},
  email: { type: String, required: true,required: true },
  role: { type: String, default: "User" },
  token: { type: String },
  status: { type: String, enum: ["pending", "accepted", "expired", "rejected"], default: "pending" },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
  expiresAt: {
  type: Date,
 default: () => new Date(Date.now() + 60 * 60 * 1000),
 // 1 hour

},
}, { timestamps: true });

OrganizationInviteSchema.index({ orgId: 1, email: 1 }, { unique: true });

export const OrganizationInvite = mongoose.model("OrganizationInvite", OrganizationInviteSchema);