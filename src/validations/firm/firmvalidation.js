import { z } from "zod";

export const firmValidationSchema = z.object({
  FirmName: z.string({ required_error: "Firm name is required." }),
  email: z
    .string({ required_error: "Firm email is required." })
    .trim()
    .email("Invalid email format."),
  phone: z.string({ required_error: "Phone number is required." }),
  invoicePrefix: z.string({ required_error: "Invoice prefix is required." }),

  add: z.object({
    address1: z.string({ required_error: "Address line 1 is required." }),
    address2: z.string({ required_error: "Address line 2 is required." }),
    city: z.string({ required_error: "Address city is required." }),
    state: z.string({ required_error: "Address state is required." }),
    country: z.string({ required_error: "Address country is required." }),
    pinCode: z.number({ required_error: "Address pinCode is required." }),
  }),
  contectPerson: z
    .object({
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
      altPhone: z.number(),
      altMobile: z.number().optional(),
    })
    .optional(),

  website: z.string().optional(),
  gst_no: z.string({ required_error: "gst no is required." }),

  uin: z.string().optional(),
  tinNo: z.string().optional(),
  cinNo: z.string().optional(),

  orgId: z.string().optional(),
});
