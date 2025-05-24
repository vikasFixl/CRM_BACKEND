import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),

  panNo: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  orgId: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dob: z.string().optional(),
  doj: z.string().optional(),
  designation: z.string().optional(),
  panno: z.string().optional(),
  bankDetails: z
    .object({
      accountNo: z.string(),
      ifsc: z.string(),
    })
    .optional(),
  organizationId: z
    .array(
      z.object({
        _id: z.string().min(1, "Organization ID is required"),
        role: z.enum([
          "SuperAdmin",
          "OrgAdmin",
          "Manager",
          "SupportAgent",
          "User",
          "Custom",
        ]),
      })
    )
    .optional(),
  // contactInfo: z
  //   .object({
  //     address: z.string().optional(),
  //     city: z.string().optional(),
  //     state: z.string().optional(),
  //     zip: z.string().optional(),
  //     country: z.string().optional(),
  //   })
  //   .optional(),
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
