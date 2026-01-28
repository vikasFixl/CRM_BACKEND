import mongoose from "mongoose";
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    /**
     * Who performed the action
     */
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
      index: true
    },

    actorRole: {
      type: String,
      enum: ["Employee", "Manager", "Admin"],
      required: true,
      default: "Admin",
    },

    /**
     * What entity was affected
     */
    entityType: {
      type: String,
      enum: [
        "Attendance",
        "ShiftAssignment",
        "LeaveRequest",
        "Payroll",
        "Employee",
        "Policy"
      ],
      required: true,
      index: true
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    /**
     * Action performed
     */
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "OVERRIDE",
        "LOCK",
        "UNLOCK",
        "APPROVE",
        "REJECT"
      ],
      required: true,
      index: true
    },

    /**
     * Optional context (human readable)
     */
    message: {
      type: String,
      trim: true
    },

    /**
     * Snapshot for critical changes
     */
    before: {
      type: Schema.Types.Mixed
    },

    after: {
      type: Schema.Types.Mixed
    },

    /**
     * Request metadata
     */
    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔒 Audit logs are append-only */
auditLogSchema.pre("updateOne", () => {
  throw new Error("Audit logs are immutable");
});
auditLogSchema.pre("deleteOne", () => {
  throw new Error("Audit logs cannot be deleted");
});

/* ⚡ Common queries */
auditLogSchema.index({
  organizationId: 1,
  entityType: 1,
  createdAt: -1
});

auditLogSchema.index({
  organizationId: 1,
  actorId: 1,
  createdAt: -1
});

export const HrmAuditLog =  mongoose.model("HrmAuditLog", auditLogSchema);
