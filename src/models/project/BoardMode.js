
import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    type: {
      type: String,
      enum: ["kanban", "scrum"],
      required: true,
      default: "kanban",
    },
    visibility: {
      type: String,
      enum: ["public", "team", "private"],
      default: "public",
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    }, // null = project-level board
    // Flag to indicate default board
    isProjectDefault: { type: Boolean, default: false },

    columns: [
      {
        name: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        key: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
      },
    ],
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    // help to identify that we can delte bord or not 
    deletable: {
      type: Boolean,
      default:false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     
    }

  },
  { timestamps: true }
);

// Compound index to speed up queries filtering by project and team
BoardSchema.index({ projectId: 1, teamId: 1 });
BoardSchema.index({ name: 1, projectId: 1 }, { unique: true }); // unique name per project

BoardSchema.index(
  { projectId: 1 },
  {
    unique: true,
    partialFilterExpression: { isProjectDefault: true }
  }
);

export const Board = mongoose.model("Board", BoardSchema);
