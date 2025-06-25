// seed/projectTemplatesSeeder.js

import mongoose from "mongoose";
import { ProjectTemplate } from "../models/project/ProjectTemplateModel.js";

import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
console.log(process.env.MONGODB_URI);

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://cubicle_crm:crm123@cluster0.gkuhyji.mongodb.net/CRMpROD",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
};

const templates = [
  {
    name: "Kanban Board",
    description:
      "Simple board for continuous delivery with no sprints or epics.",
    boardType: "kanban",
    columns: ["Backlog", "To Do", "In Progress", "Blocked", "Done"],

    workflow: {
      states: [
        { Key: "backlog", name: "Backlog", color: "#6c757d", order: 0 },
        {
          Key: "todo",
          name: "To Do",
          color: "#d3d3d3",
          isDefault: true,
          order: 1,
        },
        { Key: "in_progress", name: "In Progress", color: "#f0ad4e", order: 2 },
        { Key: "blocked", name: "Blocked", color: "#d9534f", order: 3 },
        { Key: "done", name: "Done", color: "#5cb85c", order: 4 },
      ],
      transitions: [
        { from: "backlog", to: "todo" },
        { from: "todo", to: "in_progress" },
        { from: "in_progress", to: "blocked" },
        { from: "blocked", to: "in_progress" },
        { from: "in_progress", to: "done" },
      ],
    },

    automationRules: [
      {
        name: "Notify on Block",
        trigger: { event: "status_changed", to: "blocked" },
        conditions: {},
        actions: { notify: "assignee" },
      },
    ],

    settings: {
      enableStoryPoints: false,
      enableEpics: false,
      enableSprints: false,
      defaultTaskTypes: ["task", "bug"],
    },
    isSystem: true,
  },
  {
    name: "Agile Scrum",
    description:
      "A standard Scrum-based project with sprints, epics, story points, and automation.",
    boardType: "scrum",
    columns: ["To Do", "In Progress", "Review", "Done"],

    workflow: {
      states: [
        {
          Key: "todo",
          name: "To Do",
          color: "#d3d3d3",
          isDefault: true,
          order: 1,
        },
        { Key: "in_progress", name: "In Progress", color: "#f0ad4e", order: 2 },
        { Key: "review", name: "Review", color: "#5bc0de", order: 3 },
        { Key: "done", name: "Done", color: "#5cb85c", order: 4 },
      ],
      transitions: [
        { from: "todo", to: "in_progress" },
        { from: "in_progress", to: "review" },
        { from: "review", to: "done" },
        { from: "review", to: "in_progress" },
      ],
    },

    automationRules: [
      {
        name: "Auto-assign on creation",
        trigger: { event: "task_created" },
        conditions: {},
        actions: { assignTo: "reporter" },
      },
    ],

    settings: {
      enableStoryPoints: true,
      enableEpics: true,
      enableSprints: true,
      defaultTaskTypes: ["story", "task", "bug", "spike"],
    },
    isSystem: true,
  },
];

const seedTemplates = async () => {
  try {
    await connectDB();

    for (const template of templates) {
      const exists = await ProjectTemplate.findOne({ name: template.name });
      if (!exists) {
        await ProjectTemplate.create(template);
        console.log(`✅ Seeded: ${template.name}`);
      } else {
        console.log(`⚠️ Already exists: ${template.name}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding templates:", err);
    process.exit(1);
  }
};

seedTemplates();
