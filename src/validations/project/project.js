import { z } from "zod";
import mongoose from "mongoose";

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Project name is required" })
    .min(1, "Project name cannot be empty").nonempty("Project name cannot be empty"),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),

  templateId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid template ID",
  }),

  visibility: z.enum(["public", "private"], {
    required_error: "Visibility must be either 'public' or 'private'",
    invalid_type_error: "Visibility must be a string (public/private)",
  }),
});
export const projectIdSchema = z
  .string()
  .min(1, { message: "Project ID is required" })
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid project ID",
  });
// src/validations/member.validation.js

const AllowedProjectRoles = ["ProjectAdmin", "ProjectMember", "ProjectViewer"];

export const addMemberSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address"),

  level: z.enum(["workspace", "project",], {
    required_error: "Level must be either 'workspace' or 'project'",
  }),

  workspaceId: z
    .string({
      required_error: "Workspace ID is required",
      invalid_type_error: "Workspace ID must be a string",
    })
    .min(1, "Workspace ID cannot be empty"),

  role: z
    .string({
      required_error: "Role is required",
      invalid_type_error: "Role must be a string",
    }).nonempty("Role cannot be empty")
    .refine((val) => AllowedProjectRoles.includes(val), {
      message: "Invalid role provided",
    }),
});
