export const Templates = [
  {
    name: "Agile Scrum",
    description: "Agile Scrum board with backlog, structured sprints, and story point tracking.",
    boardType: "scrum",
    boardColumns: [
      { name: "Backlog", key: "backlog", order: 0, color: "#B0BEC5", category: "planning" },
      { name: "todo", key: "todo", order: 1, color: "#FFB74D", category: "todo" },
      { name: "In Progress", key: "in_progress", order: 2, color: "#64B5F6", category: "in_progress" },
      { name: "Done", key: "done", order: 3, color: "#81C784", category: "done" },
    ],
    workflow: {
      states: [
        { key: "backlog", name: "Backlog", category: "planning", color: "#B0BEC5", order: 0 },
        { key: "todo", name: "todo", category: "todo", color: "#FFB74D", order: 1 },
        { key: "in_progress", name: "In Progress", category: "in_progress", color: "#64B5F6", order: 2 },
        { key: "done", name: "Done", category: "done", color: "#81C784", order: 3, isDefault: true },
      ],
      transitions: [
        { fromKey: "backlog", toKey: "todo", fromOrder: 0, toOrder: 1 },
        { fromKey: "backlog", toKey: "in_progress", fromOrder: 0, toOrder: 2 },
        { fromKey: "backlog", toKey: "done", fromOrder: 0, toOrder: 3 },

        { fromKey: "todo", toKey: "backlog", fromOrder: 1, toOrder: 0 },
        { fromKey: "todo", toKey: "in_progress", fromOrder: 1, toOrder: 2 },
        { fromKey: "todo", toKey: "done", fromOrder: 1, toOrder: 3 },

        { fromKey: "in_progress", toKey: "backlog", fromOrder: 2, toOrder: 0 },
        { fromKey: "in_progress", toKey: "todo", fromOrder: 2, toOrder: 1 },
        { fromKey: "in_progress", toKey: "done", fromOrder: 2, toOrder: 3 },

        { fromKey: "done", toKey: "backlog", fromOrder: 3, toOrder: 0 },
        { fromKey: "done", toKey: "todo", fromOrder: 3, toOrder: 1 },
        { fromKey: "done", toKey: "in_progress", fromOrder: 3, toOrder: 2 },
      ],
    }
    ,
    settings: {
      enableStoryPoints: true,
      enableEpics: true,
      enableSprints: true,
      defaultTaskTypes: ["story", "task", "bug"],
      customFields: [],
    },
    issueTypes: [
      { key: "story", name: "Story", color: "#4FC3F7" },
      { key: "task", name: "Task", color: "#81D4FA" },
      { key: "bug", name: "Bug", color: "#E57373" },
    ],
    previewImage: "/images/templates/scrum.png",
    category: "engineering",
    recommended: true,
    isSystem: true,
  },

  {
    name: "Kanban Board",
    description: "A simple Kanban board with continuous delivery workflow.",
    boardType: "kanban",
    boardColumns: [
      { name: "todo", key: "todo", order: 0, color: "#FFD54F", category: "todo" },
      { name: "In Review", key: "in_review", order: 1, color: "#BA68C8", category: "in_progress" },
      { name: "In Progress", key: "in_progress", order: 2, color: "#4FC3F7", category: "in_progress" },
      { name: "Done", key: "done", order: 3, color: "#81C784", category: "done" },
    ],
    workflow: {
      states: [
        { key: "todo", name: "todo", category: "todo", color: "#FFD54F", order: 0 },
        { key: "in_review", name: "In Review", category: "in_progress", color: "#BA68C8", order: 1 },
        { key: "in_progress", name: "In Progress", category: "in_progress", color: "#4FC3F7", order: 2 },
        { key: "done", name: "Done", category: "done", color: "#81C784", order: 3, isDefault: true },
      ],
      transitions: [
        // From "todo"
        { fromKey: "todo", toKey: "in_review", fromOrder: 0, toOrder: 1 },
        { fromKey: "todo", toKey: "in_progress", fromOrder: 0, toOrder: 2 },
        { fromKey: "todo", toKey: "done", fromOrder: 0, toOrder: 3 },

        // From "in_review"
        { fromKey: "in_review", toKey: "todo", fromOrder: 1, toOrder: 0 },
        { fromKey: "in_review", toKey: "in_progress", fromOrder: 1, toOrder: 2 },
        { fromKey: "in_review", toKey: "done", fromOrder: 1, toOrder: 3 },

        // From "in_progress"
        { fromKey: "in_progress", toKey: "todo", fromOrder: 2, toOrder: 0 },
        { fromKey: "in_progress", toKey: "in_review", fromOrder: 2, toOrder: 1 },
        { fromKey: "in_progress", toKey: "done", fromOrder: 2, toOrder: 3 },

        // From "done"
        { fromKey: "done", toKey: "todo", fromOrder: 3, toOrder: 0 },
        { fromKey: "done", toKey: "in_review", fromOrder: 3, toOrder: 1 },
        { fromKey: "done", toKey: "in_progress", fromOrder: 3, toOrder: 2 },
      ]

    },
    task: [
      {
        summary: "This is your Kanban board!",
        description: "You can track tasks here without sprints.",
        type: "task",
        status: "todo",
        priority: "Medium",
        columnOrder: 0,
        labels: ["sample"],
        isTemplateTask: true,
      },
      {
        summary: "Start working on a card",
        description: "Drag this task into In Progress when ready.",
        type: "task",
        status: "In_progress",
        columnOrder: 2,
        priority: "Low",
        labels: ["sample", "how-to"],
        isTemplateTask: true,
      },
    ],
    settings: {
      enableStoryPoints: false,
      enableEpics: false,
      enableSprints: false,
      defaultTaskTypes: ["task", "bug", "maintenance"],
      customFields: [],
    },
    issueTypes: [
      { key: "story", name: "Story", color: "#4FC3F7" },
      { key: "task", name: "Task", color: "#81D4FA" },
      { key: "bug", name: "Bug", color: "#E57373" },
    ],
    previewImage: "/images/templates/kanban.png",
    category: "engineering",
    recommended: true,
    isSystem: true,
  },

  {
    name: "Bug Tracker",
    description: "Track bugs through discovery, validation, and resolution lifecycle.",
    boardType: "kanban",
    boardColumns: [
      { name: "New", key: "new", order: 0, color: "#FF8A65", category: "todo" },
      { name: "Resolved", key: "resolved", order: 1, color: "#4DB6AC", category: "in_progress" },
      { name: "Reopened", key: "reopened", order: 2, color: "#4FC3F7", category: "in_progress" },
      { name: "Closed", key: "closed", order: 3, color: "#81C784", category: "done" },
    ],
    workflow: {
      states: [
        { key: "new", name: "New", category: "todo", color: "#FF8A65", order: 0 },
        { key: "resolved", name: "Resolved", category: "in_progress", color: "#4DB6AC", order: 1 },
        { key: "reopened", name: "Reopened", category: "in_progress", color: "#4FC3F7", order: 2 },
        { key: "closed", name: "Closed", category: "done", color: "#81C784", order: 3, isDefault: true },
      ],
      transitions: [
        // From "new"
        { fromKey: "new", toKey: "resolved", fromOrder: 0, toOrder: 1 },
        { fromKey: "new", toKey: "reopened", fromOrder: 0, toOrder: 2 },
        { fromKey: "new", toKey: "closed", fromOrder: 0, toOrder: 3 },

        // From "resolved"
        { fromKey: "resolved", toKey: "new", fromOrder: 1, toOrder: 0 },
        { fromKey: "resolved", toKey: "reopened", fromOrder: 1, toOrder: 2 },
        { fromKey: "resolved", toKey: "closed", fromOrder: 1, toOrder: 3 },

        // From "reopened"
        { fromKey: "reopened", toKey: "new", fromOrder: 2, toOrder: 0 },
        { fromKey: "reopened", toKey: "resolved", fromOrder: 2, toOrder: 1 },
        { fromKey: "reopened", toKey: "closed", fromOrder: 2, toOrder: 3 },

        // From "closed"
        { fromKey: "closed", toKey: "new", fromOrder: 3, toOrder: 0 },
        { fromKey: "closed", toKey: "resolved", fromOrder: 3, toOrder: 1 },
        { fromKey: "closed", toKey: "reopened", fromOrder: 3, toOrder: 2 },
      ]

    },
    settings: {
      enableStoryPoints: false,
      enableEpics: false,
      enableSprints: false,
      defaultTaskTypes: ["bug", "incident", "regression"],
      customFields: [
        { key: "severity", name: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
        { key: "affectedVersion", name: "Affected Version", type: "text" },
      ],
    },
    issueTypes: [
      { key: "bug", name: "Bug", color: "#E57373" },
      { key: "incident", name: "Incident", color: "#BA68C8" },
      { key: "regression", name: "Regression", color: "#F06292" },
    ],
    previewImage: "/images/templates/bugtracker.png",
    category: "qa",
    recommended: false,
    isSystem: true,
  },
];
