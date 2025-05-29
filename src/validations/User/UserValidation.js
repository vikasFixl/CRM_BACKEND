import { z } from "zod";



export const signupSchema = z.object({
  firstName: z.string({
    required_error: "First name is required",
  }),
  lastName: z.string({
    required_error: "Last name is required",
  }),
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email address"),
  password: z.string({
    required_error: "Password is required",
  }).min(6, "Password must be at least 6 characters long"),

  panNo: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().min(10, "Phone number must be 10 digits").max(10, "Phone number must be 10 digits").optional(),
  orgId: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    invalid_type_error: "Gender must be one of: Male, Female, or Other",
  }).optional(),
  dob: z.string().optional(),
  doj: z.string().optional(),
  designation: z.string().optional(),
  panno: z.string().optional(),
  bankDetails: z.object({
    accountNo: z.string({
      required_error: "Account number is required",
    }),
    ifsc: z.string({
      required_error: "IFSC code is required",
    }),
  }).optional(),
  organizationId: z.array(z.object({
    _id: z.string({
      required_error: "Organization ID is required",
    }).min(1, "Organization ID cannot be empty"),
    role: z.enum([
      "SuperAdmin",
      "OrgAdmin",
      "Manager",
      "SupportAgent",
      "User",
      "Custom",
    ], {
      invalid_type_error: "Invalid role type",
    }),
  })).optional(),

  isActive: z.boolean().optional().default(true),
  lastLogin: z.coerce.date().optional(),
  loginAttempts: z.number().optional().default(0),
  lockUntil: z.coerce.date().optional(),
});


export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["active", "inactive", "deleted"]).optional(),
});
