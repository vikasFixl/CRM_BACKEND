import { z } from "zod";
const nameRegex = /^[A-Za-z]+$/;

export const signupSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1)
    .regex(nameRegex, "First name can only contain alphabetic letters (A-Z).")
    .nonempty("First name cannot be empty"),
  lastName: z.string().optional(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),

  phone: z
    .string({ required_error: "Phone number is required" })
    .length(10, "Phone number must be exactly 10 digits"),
  avatar: z
    .object({
      url: z.string().url("Invalid avatar URL"),
      public_id: z.string(),
    })
    .optional(),
  isActive: z.boolean().optional().default(true),

  lastLogin: z.coerce.date().optional(),

  // You may choose to exclude timestamps (createdAt, updatedAt) since they are automatic
});





export const updateUserSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1, "First name cannot be empty")
    .regex(nameRegex, "First name can only contain alphabetic letters (A-Z)"),

  lastName: z
    .string()
    .optional(),

  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email cannot be empty"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),

  phone: z
    .string({ required_error: "Phone number is required" })
    .length(10, "Phone number must be exactly 10 digits"),

  avatar: z
    .object({
      url: z.string().url("Invalid avatar URL"),
      public_id: z.string(),
    })
    .optional(),

  twoFAEnabled: z.boolean(),

  isActive: z.boolean().optional(),
});