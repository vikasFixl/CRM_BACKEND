import { z } from "zod";
const nameRegex = /^[A-Za-z]+$/;

export const signupSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(1)
    .regex(nameRegex, "First name can only contain alphabetic letters (A-Z).")
   ,

  lastName: z
    .string({ required_error: "Last name is required" })
    .min(1)
    .regex(nameRegex, "last name can only contain alphabetic letters (A-Z).")
    
,
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),

  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .optional(),

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
    .min(1)
    .regex(nameRegex, "First name can only contain alphabetic letters (A-Z).")
    .optional(),

  lastName: z
    .string({ required_error: "Last name is required" })
    .min(1)
    .regex(nameRegex, "last name can only contain alphabetic letters (A-Z).")
    .optional(),
  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),

  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .optional(),

  avatar: z
    .object({
      url: z.string().url("Invalid avatar URL"),
      public_id: z.string(),
    })
    .optional(),

  isActive: z.boolean().optional(),
  lastLogin: z.coerce.date().optional(),
});
