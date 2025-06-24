const AuditLogSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true }, // e.g., "task_created", "status_changed"
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // oldValue, newValue, reason, etc.
    ipAddress: { type: String },  // Optional: track IP of actor if relevant
    userAgent: { type: String },  // Optional: browser or client info
  },
  { timestamps: true }
);

AuditLogSchema.index({ projectId: 1, taskId: 1, actorId: 1 });

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
