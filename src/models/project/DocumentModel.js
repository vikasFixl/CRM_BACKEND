import mongoose from "mongoose";

const documentSchema = mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
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
      name: { type: String, required: true },     // e.g., "proposal.pdf"
      url: { type: String, required: true },       // Cloudinary URL
      public_id: { type: String, required: true }, // For deletion via API
      type: { type: String },                      // MIME type (optional)
      size: { type: Number },                      // File size in bytes
    },
    image: {
      url: { type: String },        // Optional: preview thumbnail or image
      public_id: { type: String },  // Optional: for deletion
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);

// {
//   "projectId": "648...abc",
//   "file": {
//     "name": "contract.pdf",
//     "url": "https://res.cloudinary.com/demo/file/upload/v1/contract.pdf",
//     "public_id": "crm/files/contract_abc123",
//     "type": "application/pdf",
//     "size": 231452
//   },
//   "image": {
//     "url": "https://res.cloudinary.com/demo/image/upload/v1/contract-preview.png",
//     "public_id": "crm/previews/contract-thumb_abc123"
//   },
//   "uploadedBy": "646...xyz",
//   "isDeleted": false,
//   "createdAt": "2025-06-21T10:55:21.123Z"
// }
