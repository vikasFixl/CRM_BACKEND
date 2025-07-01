import { z } from "zod";

export const ValidateOrganizationSchema = z.object({
  name: z
    .string({ message: "Organization name is required" })
    .nonempty("Organization name cannot be empty"),
  contactEmail: z
    .string({ required_error: "Email is required" })
    .email()
    .nonempty("Email cannot be empty"),
  contactPhone: z.string().min(10).max(12),
  address: z.string({ required_error: "Address is required" }).min(1),
  orgCity: z.string().optional(),
  orgState: z.string().optional(),
  orgCountry: z
    .string({ required_error: "Country is required" })
    .nonempty("Country cannot be empty"),
  contactName: z
    .string({ required_error: "Contact person name is required" })
    .nonempty("Contact person name cannot be empty"),
});
