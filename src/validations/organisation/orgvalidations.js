import { z } from "zod";

export const ValidateOrganizationSchema = z.object({
  name: z.string({ message: "Organization name is required" }),
  contactEmail: z.string({ required_error: "Email is required" }).email(),
  contactPhone: z
    .string()
    .min(10)
    .max(12),
  address: z.string({ required_error: "Address is required" }).min(1,),
  orgCity: z.string({ required_error: "City is required" }),
  orgState: z.string({ required_error: "State is required" }),
  orgCountry: z.string({ required_error: "Country is required" }),
  contactName: z.string({ required_error: "Contact person name is required" })
});
