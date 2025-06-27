import { z } from "zod";
import mongoose from "mongoose";

export const workspaceSchema = z.object({
  name: z.string().min(3).max(20),
  description: z.string().trim().optional(),
});
export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required" })
  .max(255);

export const descriptionSchema = z.string().trim().optional();

export const workspaceIdSchema = z

  .string().min(1, { message: "Workspace ID is required" })
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid workspace ID",
  });

export const changeRoleSchema = z.object({
  roleId: z.string().trim().min(1),
  memberId: z.string().trim().min(1),
});

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});
