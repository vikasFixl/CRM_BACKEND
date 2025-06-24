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
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
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
      default: "private",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null, // null for public/private boards
    },
    filterQuery: {
      type: String, // optional saved filter or query string
      default: "",
    },
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
