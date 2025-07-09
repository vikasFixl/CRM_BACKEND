import mongoose from "mongoose";

const documentSchema = mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },

    level: {
      type: String,
      enum: ["organization", "workspace", "project", "task"],
      required: true,
      index: true,
      description: "Scope level at which the document is stored",
    },

    file: {
      name: { type: String },        // Filename
      url: { type: String},         // Cloudinary or other provider URL
      public_id: { type: String },   // Cloudinary/S3 public_id
      type: { type: String },                        // MIME type
      size: { type: Number },                        // File size (bytes)
    },

    image: {
      url: { type: String, default: null },          // Optional preview thumbnail
      public_id: { type: String, default: null }, 
      size: { type: Number, default: null },         // Optional for deletion
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

export const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);