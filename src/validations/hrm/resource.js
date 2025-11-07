import { z } from "zod";

export const assetSchema = z.object({
  assetName: z.string().trim().min(1, "assetName is required"),
  
  assetType: z.enum(["Laptop", "Mobile", "Monitor", "Chair", "Other"], {
    errorMap: () => ({ message: "Invalid asset type" }),
  }),

  serialNumber: z.string().trim().min(1, "serialNumber is required"),

  condition: z.enum(["New", "Good", "Needs Repair", "Retired"]).default("Good"),

  status: z.enum(["Available", "Assigned", "Lost", "Damaged", "Retired"]).default("Available"),

  purchaseDate: z.date().optional(),

  cost: z.number().optional(),

  notes: z.string().optional(),
});
