export const Templates = [
    {
  name: "Agile Scrum",
  description: "Agile Scrum board with backlog, structured sprints, and story point tracking.",
  boardType: "scrum",
  workflow: {
    states: [
      { key: "backlog", name: "Backlog", category: "planning", color: "#B0BEC5", order: 0 },
      { key: "todo", name: "To Do", category: "todo", color: "#FFB74D", order: 1 },
      { key: "in_progress", name: "In Progress", category: "in_progress", color: "#64B5F6", order: 2 },
      { key: "done", name: "Done", category: "done", color: "#81C784", order: 3, isDefault: true }
    ],
    transitions: [
      { from: "backlog", to: "todo" },
      { from: "todo", to: "in_progress" },
      { from: "in_progress", to: "done" }
    ]
  },
  settings: {
    enableStoryPoints: true,
    enableEpics: true,
    enableSprints: true,
    defaultTaskTypes: ["story", "task", "bug"],
    customFields: []
  },
  issueTypes: [
    { key: "story", name: "Story", color: "#4FC3F7", icon: "📘" },
    { key: "task", name: "Task", color: "#81D4FA", icon: "📋" },
    { key: "bug", name: "Bug", color: "#E57373", icon: "🐞" }
  ],
  previewImage: "/images/templates/scrum.png",
  category: "engineering",
  recommended: true,
  isSystem: true
},
{
  name: "Kanban Board",
  description: "A simple Kanban board with continuous delivery workflow.",
  boardType: "kanban",
  workflow: {
    states: [
      { key: "todo", name: "To Do", category: "todo", color: "#FFD54F", order: 0 },
      { key: "in_review", name: "In Review", category: "in_progress", color: "#BA68C8", order: 1 },
      { key: "in_progress", name: "In Progress", category: "in_progress", color: "#4FC3F7", order: 2 },
      { key: "done", name: "Done", category: "done", color: "#81C784", order: 3, isDefault: true }
    ],
    transitions: [
      { from: "todo", to: "in_review" },
      { from: "in_review", to: "in_progress" },
      { from: "in_progress", to: "done" }
    ]
  },
  settings: {
    enableStoryPoints: false,
    enableEpics: false,
    enableSprints: false,
    defaultTaskTypes: ["task", "bug", "maintenance"],
    customFields: []
  },
  issueTypes: [
     { key: "story", name: "Story", color: "#4FC3F7", icon: "📘" },
    { key: "task", name: "Task", color: "#81D4FA", icon: "📋" },
    { key: "bug", name: "Bug", color: "#E57373", icon: "🐞" }
  ],
  previewImage: "/images/templates/kanban.png",
  category: "engineering",
  recommended: true,
  isSystem: true
},
{
  name: "Bug Tracker",
  description: "Track bugs through discovery, validation, and resolution lifecycle.",
  boardType: "kanban",
  workflow: {
  states: [
    {
      key: "new",
      name: "New",
      category: "todo",
      color: "#FF8A65",
      order: 0
    },
    {
      key: "resolved",
      name: "Resolved",
      category: "in_progress",
      color: "#4DB6AC",
      order: 1
    },
    {
      key: "reopened",
      name: "Reopened",
      category: "in_progress",
      color: "#4FC3F7",
      order: 2
    },
    {
      key: "closed",
      name: "Closed",
      category: "done",
      color: "#81C784",
      order: 3,
      isDefault: true
    }
  ],
  transitions: [
    { from: "new", to: "resolved" },
    { from: "resolved", to: "closed" },
    { from: "resolved", to: "reopened" },
    { from: "reopened", to: "resolved" },
    { from: "reopened", to: "closed" }
  ]
}
,
  settings: {
    enableStoryPoints: false,
    enableEpics: false,
    enableSprints: false,
    defaultTaskTypes: ["bug", "incident", "regression"],
    customFields: [
      { key: "severity", name: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "affectedVersion", name: "Affected Version", type: "text" }
    ]
  },
  issueTypes: [
    { key: "bug", name: "Bug", color: "#E57373", icon: "🐞" },
    { key: "incident", name: "Incident", color: "#BA68C8", icon: "⚠️" },
    { key: "regression", name: "Regression", color: "#F06292", icon: "🔁" }
  ],
  previewImage: "/images/templates/bugtracker.png",
  category: "qa",
  recommended: false,
  isSystem: true
}



];