import { z } from "zod";

// ✅ Zod Schema Validation
export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  description: z.string().optional(),
  head: z.string().optional(),
});