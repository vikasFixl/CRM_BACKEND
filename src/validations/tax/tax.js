import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Schema for a single tax rate
const taxRateSchema = z.object({
  name: z.string({ required_error: "Tax name is required" }).min(1),
  rate: z
    .number({ required_error: "Rate is required" })
    .min(0, "Rate must be a positive number"),
  description: z.string().optional(),
  isEnabled: z.boolean().optional().default(true),
});

// Main tax schema
export const taxSchema = z.object({
  firmId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid firmId" }),

  taxRates: z
    .array(taxRateSchema)
    .min(1, { message: "At least one tax rate is required" }),
});
export const globalTaxSchema = z.object({
  orgId: z.string().optional(),
  taxRates: z
    .array(
      z.object({
        name: z.string().min(1),
        rate: z.number().min(0),
        description: z.string().optional(),
        isEnabled: z.boolean().optional(),
      })
    )
    .min(1, "At least one tax rate is required"),
});
