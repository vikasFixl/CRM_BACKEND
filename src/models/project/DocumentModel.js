import mongoose from "mongoose";

const documentSchema = mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    file: {
      name: { type: String, required: true },        // Filename
      url: { type: String, required: true },         // Cloudinary or other provider URL
      public_id: { type: String, required: true },   // Cloudinary/S3 public_id
      type: { type: String },                        // MIME type
      size: { type: Number },                        // File size (bytes)
    },

    image: {
      url: { type: String, default: null },          // Optional preview thumbnail
      public_id: { type: String, default: null },    // Optional for deletion
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes
documentSchema.index({ projectId: 1 });
documentSchema.index({ taskId: 1 });
documentSchema.index({ "file.public_id": 1 });

export const Document = mongoose.model("Document", documentSchema);
