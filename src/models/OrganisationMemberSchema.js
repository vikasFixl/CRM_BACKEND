import mongoose from "mongoose";

const orgMemberSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true, // optional: only if employee IDs are globally unique
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission", // Reference to role/permission set
      required: true,
    },
    permissionsOverride: [
      {
        module: { type: String }, // Optional: to override specific permissions
        actions: [{ type: String }],
      },
    ],

    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["invited", "active", "suspended", "left"],
      default: "active",
    },
    hasCustomPermission: {
      type: Boolean,
      default: false, // false unless overridden
    },
  },
  { timestamps: true }
);

export const OrgMember = mongoose.model("OrgMember", orgMemberSchema);
