import { z } from "zod";

export const ValidateOrganizationSchema = z.object({
  name: z.string().min(1, { message: "Organization name is required" }),
  contactEmail: z.string().email({ message: "A valid email is required" }),
  contactPhone: z
    .string()
    .min(10, { message: "Contact phone must be at least 10 digits" })
    .max(15, { message: "Contact phone can't exceed 15 digits" }),
  address: z.string().min(1, { message: "Address is required" }),
  orgCity: z.string().min(1, { message: "City is required" }),
  orgState: z.string().min(1, { message: "State is required" }),
  orgCountry: z.string().min(1, { message: "Country is required" }),
  contactName: z.string().min(1, { message: "Contact person name is required" }),
});
