import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

AuditLogSchema.index({ organizationId: 1, entityType: 1, entityId: 1 });
AuditLogSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });

export const AuditLog = mongoose.model("SCMAuditLog", AuditLogSchema);


