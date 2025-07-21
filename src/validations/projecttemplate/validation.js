import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(mongoose.isValidObjectId, {
  message: "Invalid ObjectId",
});

// 🔹 Column Schema (Board Columns)
const ColumnSchema = z.object({
  name: z.string({ required_error: " column Name is required" }).min(1),
  key: z.string({ required_error: " cloumn Key is required" }).min(1),
  order: z.number({ required_error: " column Order is required" }).int().min(0),
  color: z.string().optional(),
  category: z.string().optional(),
});

// 🔹 Workflow State Schema
const StateSchema = z.object({
  key: z.string({ required_error: "Key is required" }).min(1),
  name: z.string({ required_error: "Name is required" }).min(1),
  category: z.string().optional(),
  color: z.string({ required_error: "Color is required" }).optional(),
  order: z.number({ required_error: "Order is required" }).int().min(0),
  isDefault: z.boolean().optional(),
});

// 🔹 Workflow Transition Schema
const TransitionSchema = z.object({
  fromKey: z.string({ required_error: "From key is required" }).min(1),
  toKey: z.string({ required_error: "To key is required" }).min(1),
  fromOrder: z.number({ required_error: "From order is required" }).int().min(0),
  toOrder: z.number({ required_error: "To order is required" }).int().min(0),
  label: z.string().optional(),
  requiresApproval: z.boolean().optional(),
});

// 🔹 Task Template Schema
const TaskTemplateSchema = z.object({
  summary: z.string({ required_error: "Summary is required" }).min(1),
  description: z.string({ required_error: "Description is required" }).optional(),
  type: z.string({ required_error: "Type is required" }).min(1),
  status: z.string({ required_error: "Status is required" }).min(1),
  columnOrder: z.number({ required_error: "Column order is required" }).int().min(0),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  labels: z.array(z.string()).optional(),
  storyPoints: z.number().optional(),
});

// 🔹 Automation Rule Schema
const AutomationRuleSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1),
  description: z.string({ required_error: "Description is required" }).optional(),
  trigger: z.any().optional(),
  conditions: z.any().optional(),
  actions: z.any().optional(),
});

// 🔹 Settings Schema
const SettingsSchema = z.object({
  enableStoryPoints: z.boolean().optional(),
  enableEpics: z.boolean().optional(),
  enableSprints: z.boolean().optional(),
defaultTaskTypes: z.array(z.string()).optional(),

  customFields: z.array(z.any()).optional(),
});

// 🔹 Issue Type Schema
const IssueTypeSchema = z.object({
  key: z.string({ required_error: "Key is required" }).min(1),
  name: z.string({ required_error: "Name is required" }).min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});
export const createSchema = z.object({
  name: z.string({required_error:"template Name is required"}).min(1),
  description: z.string().optional(),
  organization: objectId.nullish(),
  boardType: z.enum(["scrum", "kanban", "bug-tracking"]),
  boardColumns: z.array(ColumnSchema).optional(),
  workflow: z.object({
    states: z.array(StateSchema),
    transitions: z.array(TransitionSchema),
  }).optional(),
  automationRules: z.array(AutomationRuleSchema).optional(),
  settings: SettingsSchema.optional(),
  issueTypes: z.array(IssueTypeSchema).optional(),
  task: z.array(TaskTemplateSchema).optional(),
  category: z.string().optional(),
  recommended: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  baseTemplateId: objectId.optional(),
  createdBy: objectId.optional(),
});

export const updateSchema = createSchema.partial().extend({
  version: z.number().int().optional(),
});
