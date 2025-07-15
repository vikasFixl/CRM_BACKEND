import { z } from "zod";

// Address Schema
const addressSchema = z.object({
  address1: z.string({ required_error: "address1 is required" }).nonempty("Address 1 cannot be empty"),
  address2: z.string({ required_error: "address2 is required" }).nonempty("Address 2 cannot be empty"),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.number({ required_error: "pinCode is required" }),
  country: z.string({ required_error: "country is required" }).nonempty("Country cannot be empty"),
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
    phone: z.string().optional(),
  mobile: z.string().optional(),
  altPhone: z.string().optional(),
  altMobile: z.string().optional(),
}).optional();

// Main Client Schema
export const clientSchema = z.object({
  clientFirmName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  website: z.string().optional(),
  email: z.string({ required_error: "email is required" }).email("Invalid email format"),
  phone: z.string({ required_error: "phone is required" }),
  address: addressSchema,
  contactPerson: contactPersonSchema,
  taxId: z.string().optional(),
  tinNo: z.string().optional(),
  cinNo: z.string().optional(),
  orgId: z.string().optional(), // assuming ObjectId as string
  firmId: z.string().optional(), // assuming ObjectId as string
});


// Reusable phone validation
const phoneSchema = z
  .string().nonempty("Phone number cannot be empty")




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

});
