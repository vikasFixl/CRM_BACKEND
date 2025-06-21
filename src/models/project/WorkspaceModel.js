import mongoose from "mongoose";
import { generateInviteCode } from "../../utils/helperfuntions/generateInviteCode.js";

const workspaceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization", // reference to your Organization model
      required: true,
      index: true, // helps with fast lookups by org
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
      default: generateInviteCode,
    },
  },
  { timestamps: true }
);

// Regenerate invite code method
workspaceSchema.methods.generateInviteCode = async function () {
  this.inviteCode = generateInviteCode();
  return this.save();
};

export const Workspace = mongoose.model("Workspace", workspaceSchema);
