import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true,   // Index here as queries will often filter by recipientId
    },
    projectId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Project",
      default: null,  // Explicitly default to null if not provided
    },
    taskId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Task",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "comment_added",
        "status_changed",
        "mention",
        "general",
      ],
      required: true,
      index: true, // Index type if filtering by notification type is common
    },
    message: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 1000, // Limit message length for safety
    },
    isRead: { 
      type: Boolean, 
      default: false, 
      index: true, // To efficiently query unread notifications
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // extra contextual info like actor, timestamps, etc.
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient fetching of unread notifications per user
NotificationSchema.index({ recipientId: 1, isRead: 1, isDeleted: 1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
