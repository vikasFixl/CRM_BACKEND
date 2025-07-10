import { z } from "zod";
import mongoose from "mongoose";

// Helper to check for valid ObjectId
const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

export const createTaskSchema = z.object({
  projectId: z.string({required_error: "Project ID is required"}).refine(isValidObjectId, {
    message: "Invalid project ID",
  }),

  key: z.string().optional(), // Auto-generated server-side

  name: z
    .string( {required_error: "name is required"})
    .trim()
    .min(1)
    .max(100,"name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  type: z
    .string({required_error: " task Type is required"})
    .min(1),
    order: z.number().optional(),

  status: z
    .string({required_error: "Status is required"})
    .min(1),

  priority: z
    .enum(["Low", "Medium", "High", "Critical"])
    .optional()
    .default("Medium"),

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

 parentId: z
    .string()
    .transform((val) => (val === "" ? undefined : val)) // Convert "" to undefined
    .optional()
    .refine(
      (val) => val === undefined || isValidObjectId(val),
      {
        message: "Invalid parent task ID",
      }
    ),

  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),

 storyPoints: z
  .union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(5),
    z.literal(8),
    z.literal(13),
    z.literal(21),
  ])
  .optional(),


  labels: z.array(z.string().trim()).optional(),
  watchers: z.array(z.string().refine(isValidObjectId)).optional(),

  customFields: z.record(z.any()).optional(),
});

export const updateTaskSchema = z.object({
  // ✅ Exclude projectId and key – these should never be updated

  name: z
    .string({ required_error: "name is required" })
    .trim()
    .min(1, "name is required")
    .max(100, "name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  type: z.string().min(1, "Task type is required").optional(),

  status: z.string().min(1, "Status is required").optional(),

  priority: z
    .enum(["Low", "Medium", "High", "Critical"])
    .optional(),

  assigneeId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid assignee ID" })
    .optional(),

  reporterId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid reporter ID" })
    .optional(),

  assignedTeamId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid team ID" })
    .optional(),

  sprintId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid sprint ID" })
    .optional(),

  epicId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid epic ID" })
    .optional(),

  parentId: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) => val === undefined || isValidObjectId(val),
      { message: "Invalid parent task ID" }
    ),

  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),

  storyPoints: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(5),
      z.literal(8),
      z.literal(13),
      z.literal(21),
    ])
    .optional(),

  labels: z.array(z.string().trim()).optional(),

  watchers: z
    .array(z.string().refine(isValidObjectId, { message: "Invalid watcher ID" }))
    .optional(),

  customFields: z.record(z.any()).optional(),
});