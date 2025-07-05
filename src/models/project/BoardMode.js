/**
 * Organization
  └── Workspace
        └── Project
              ├── Board (many per project)
              │     ├── Displays Task (filtered by board.filter_query)
              │     ├── Can be Kanban or Scrum type
              │     └── Can show Sprints (if scrum)
              └── Task (linked by projectId, and optionally by sprintId or epicId)

              {
  "project_id": "665b12fa78d...",
  "name": "Sprint 14 Board",
  "type": "scrum",
  "filter_query": "{ sprintId: ObjectId('665b...'), status: { $ne: 'Done' } }"
}
  🧩 Summary
Feature	Jira Support	Your System Should Support
Multiple Boards per Project	✅ Yes	✅ Yes
Boards filtered by task criteria	✅ Yes	✅ Yes (filter_query)
Mixed board types in 1 project	✅ Yes	✅ Yes (Kanban + Scrum)
 */
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
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Compound index to speed up queries filtering by project and team
BoardSchema.index({ projectId: 1, teamId: 1 });
BoardSchema.index({ name: 1, projectId: 1 }, { unique: true }); // Unique board name per project

export const Board = mongoose.model("Board", BoardSchema);

// /const board = await Board.findOne({ projectId: task.projectId });
// const allowedStatus = board.columns.map(c => c.stateKey);

// if (!allowedStatus.includes(task.status)) {
//   throw new Error(`Invalid status. Must be one of: ${allowedStatus.join(", ")}`);
// }
//const getBoardForTeam = async (projectId, teamId) => {
//   let board = await Board.findOne({ projectId, teamId, isDeleted: false });
//   if (!board) {
//     board = await Board.findOne({ projectId, isProjectDefault: true, isDeleted: false });
//   }
//   return board;
// };
