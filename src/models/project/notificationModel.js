import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // What kind of notification this is (CRM, PROJECT, etc.)
        module: {
            type: String,
            enum: ["CRM", "PROJECT", "TASK", "TEAM", "GENERAL"],
            required: true,
        },

        // e.g., "task_created", "lead_assigned", etc.
        type: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },

        seenAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Optional: compound index for fast user-org scoped queries
notificationSchema.index({ userId: 1, organizationId: 1, read: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
