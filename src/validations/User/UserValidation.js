import { z } from "zod";

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

export const signupSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1, "First name cannot be empty")
    .regex(nameRegex, "First name can only contain alphabetic letters (A-Z)"),

  lastName: z.string().optional(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .regex(
      strongPasswordRegex,
      "Password must include uppercase, lowercase, number, and special character"
    ),

  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(phoneRegex, "Phone number must be in E.164 format (e.g., +1234567890)"),

  avatar: z
    .object({
      url: z.string().url("Invalid avatar URL"),
      public_id: z.string(),
    })
    .optional(),

  isActive: z.boolean().optional().default(true),
  lastLogin: z.coerce.date().optional(),

  twoFAEnabled: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1, "First name cannot be empty")
    .regex(nameRegex, "First name can only contain alphabetic letters (A-Z)"),

  lastName: z.string().optional(),

  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email cannot be empty"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      strongPasswordRegex,
      "Password must include uppercase, lowercase, number, and special character"
    )
    .optional(),

  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(phoneRegex, "Phone number must be in E.164 format (e.g., +1234567890)"),

  avatar: z
    .object({
      url: z.string().url("Invalid avatar URL"),
      public_id: z.string(),
    })
    .optional(),

  twoFAEnabled: z.boolean().optional(),

  isActive: z.boolean().optional(),
});
