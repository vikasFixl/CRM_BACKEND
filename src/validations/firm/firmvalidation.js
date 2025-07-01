import { z } from "zod";

export const firmValidationSchema = z.object({
  FirmName: z
    .string({ required_error: "Firm name is required." })
    .nonempty("Firm name cannot be empty.")
    .min(3, { message: "Firm name must be at least 3 characters long." }),

  email: z
    .string({ required_error: "Firm email is required." })
    .trim()
    .email("Invalid email format."),
  phone: z.string({ required_error: "Phone number is required." }).min(10),
  invoicePrefix: z
    .string({ required_error: "Invoice prefix is required." })
    .nonempty("Invoice prefix cannot be empty."),

  add: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pinCode: z.number().optional(),
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
      altPhone: z.number().optional(),
      altMobile: z.number().optional(),
    })
    .optional(),

  website: z.string().optional(),
  gst_no: z.string({ required_error: "gst no is required." }),

  uin: z.string().optional(),
  tinNo: z.string({ required_error: "tax id no is required." }),
  cinNo: z.string({ required_error: "company id  is required." }),

  orgId: z.string().optional(),
});
export const firmUpdateSchema = z.object({
  FirmName: z
    .string({ required_error: "Firm name is required." })
    .nonempty("Firm name cannot be empty.")
    .min(3, { message: "Firm name must be at least 3 characters long." }),
  email: z
    .string({ required_error: "Firm email is required." })
    .trim()
    .email("Invalid email format."),
  phone: z.string({ required_error: "Phone number is required." }).min(10),
  invoicePrefix: z
    .string({ required_error: "Invoice prefix is required." })
    .nonempty("Invoice prefix cannot be empty."),

  add: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pinCode: z.number().optional(),
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
      altPhone: z.number().optional(),
      altMobile: z.number().optional(),
    })
    .optional(),

  website: z.string().optional(),
  // gst_no: z.string({ required_error: "gst no is required." }),

  uin: z.string().optional(),
  // tinNo: z.string({ required_error: "tax id no is required." }),
  // cinNo: z.string({ required_error: "company id  is required." }),

  orgId: z.string().optional(),
});
