import { z } from "zod";
import mongoose from "mongoose";

// Helper to check for valid ObjectId
const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

export const createTaskSchema = z.object({
  projectId: z.string({required_error: "Project ID is required"}).refine(isValidObjectId, {
    message: "Invalid project ID",
  }),

  key: z.string().optional(), // Auto-generated server-side

  summary: z
    .string( {required_error: "Summary is required"})
    .trim()
    .min(1)
    .max(300, "Summary cannot exceed 300 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  type: z
    .string({required_error: " task Type is required"})
    .min(1),

  status: z
    .string({required_error: "Status is required"})
    .min(1),

  priority: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .default("medium"),

  assigneeId: z.string().refine(isValidObjectId, {
    message: "Invalid assignee ID",
  }).optional(),

  reporterId: z.string().refine(isValidObjectId, {
    message: "Invalid reporter ID",
  }).optional(),

  assignedTeamId: z.string().refine(isValidObjectId, {
    message: "Invalid team ID",
  }).optional(),

  sprintId: z.string().refine(isValidObjectId, {
    message: "Invalid sprint ID",
  }).optional(),

  epicId: z.string().refine(isValidObjectId, {
    message: "Invalid epic ID",
  }).optional(),

  parentId: z.string().refine(isValidObjectId, {
    message: "Invalid parent task ID",
  }).optional(),

  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),

  storyPoints: z
    .enum(["1", "2", "3", "5", "8", "13", "21"])
    .transform(Number)
    .optional(),

  labels: z.array(z.string().trim()).optional(),
  watchers: z.array(z.string().refine(isValidObjectId)).optional(),

  customFields: z.record(z.any()).optional(),
});
