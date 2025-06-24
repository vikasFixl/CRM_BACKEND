import mongoose from "mongoose";

const EpicSchema = new mongoose.Schema(
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
    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed"],
      default: "not started",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
EpicSchema.index({ slug: 1 }, { unique: true });
EpicSchema.index({ projectId: 1, key: 1 }, { unique: true });

// Slug generator
EpicSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    let slug = baseSlug;
    let count = 1;

    const Epic = mongoose.models.Epic || mongoose.model("Epic", EpicSchema);
    while (await Epic.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
  next();
});

export const Epic = mongoose.model("Epic", EpicSchema);
/**
 * ✅ Epics are not backlog tasks — they are containers for backlog tasks.
📦 What is an Epic?
A large body of work that can be broken down into smaller tasks (stories, bugs, tasks).


Used to group and organize related work across multiple sprints or weeks.


Not necessarily something assigned or completed directly like a regular task.


📌 Example:
Epic: "Refactor Authentication System"
 Tasks inside:
"Update login API"


"Migrate password hashing"


"Improve OAuth flow"



✅ What is the Backlog?
The Backlog is a prioritized list of tasks/issues for a project.


It contains:


Regular tasks/stories/bugs


These tasks may or may not be linked to an Epic.


Backlog tasks can be:


Assigned to a sprint (if you're using Scrum)


Organized by Epic (shown in the sidebar)



🔄 How They Work Together
Item
Description
Epic
High-level objective (e.g., feature, goal, theme)
Backlog
List of upcoming work items (tasks/stories/bugs)
Task
Can optionally be assigned to an Epic
Sprint
Subset of backlog planned for current cycle


🧠 In Jira UI:
The Epic panel shows all epics.


The Backlog is grouped by epic if tasks are assigned.


A task can exist in backlog without an epic too.



✅ Summary
Concept
Is it a Task?
Goes to Backlog?
Contains Subtasks?
Has Sprint?
Epic
❌ No
✅ Yes (as reference)
✅ Yes (via tasks)
❌ No
Task
✅ Yes
✅ Yes
✅ Optional (via parentId)
✅ Optional
Subtask
✅ Yes (child)
❌ Not directly
❌ No
✅ Inherits


✅ Why You Should Use Epics
1. Organize Large Features
Epics allow you to group related tasks under a common goal or feature.
Example:
Epic: "Mobile App Launch"
Task 1: Build login screen


Task 2: Implement push notifications


Task 3: Integrate crash analytics


Without epics, you'd just have a long flat list of tasks — hard to manage or report on.
📍 How Sprint is Used in Jira-like Workflows
Planning Phase


The team selects a set of tasks from the backlog.


Sprint is created with a name, goal, start & end date.


Active Phase


Tasks assigned to the sprint are actively worked on.


Progress is tracked via boards (Kanban/Scrum) and charts.


Completion Phase


When the sprint ends, tasks are marked as done, moved forward, or moved to the next sprint.


Retrospective & Reporting


Evaluate what was achieved vs. the goal.


Use metrics like velocity, completed story points, burndown chart.

 */