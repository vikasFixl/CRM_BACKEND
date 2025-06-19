import { z } from "zod";

// Address Schema
const addressSchema = z.object({
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.number().optional(),
  country: z.string().optional(),
});

// Contact Person Schema (inline address fields)
const contactPersonSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.number().optional(),
  country: z.string().optional(),
  phone: z.number().optional(),
  mobile: z.number().optional(),
  altPhone: z.number().optional(),
  altMobile: z.number().optional(),
});

// Main Client Schema
export const clientSchema = z.object({
  clientFirmName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  website: z.string().optional(),
  email: z.string({ required_error: "email is required" }).email("Invalid email format"),
  phone: z.number({ required_error: "phone is required" }),
  address: addressSchema.optional(),
  contactPerson: contactPersonSchema.optional(),
  taxId: z.string().optional(),
  tinNo: z.string().optional(),
  cinNo: z.string().optional(),
  orgId: z.string().optional(), // assuming ObjectId as string
  firmId: z.string().optional(), // assuming ObjectId as string
});


// Reusable phone validation
const phoneSchema = z
  .number()
  .int()
  .min(1000000000, "Phone must be at least 10 digits")
  .max(9999999999, "Phone must be at most 10 digits");




// ✅ Final Update Client Schema
export const updateClientSchema = z.object({
  clientFirmName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: phoneSchema,
  address: addressSchema.optional(),
  contactPerson: contactPersonSchema.optional(),
  taxId: z.string().optional(),
  tinNo: z.string().optional(),
  cinNo: z.string().optional(),

  // ❌ These are blocked — should not be updated via client input
  orgId: z.undefined().optional(),
  firmId: z.undefined().optional(),
});
