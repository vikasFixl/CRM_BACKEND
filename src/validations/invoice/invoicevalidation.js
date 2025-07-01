import { z } from "zod";

// Common sub-schemas with required validation and messages
const addressSchema = z.object({
  address1: z
    .string({ required_error: "address1 is required" })
    .nonempty("Address 1 cannot be empty"),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z
    .string({ required_error: "country is required" })
    .nonempty("Country cannot be empty"),
  pinCode: z.number({ required_error: "pinCode is required" }),
});

const clientSchema = z.object({
  firstName: z
    .string({ required_error: "firstName is required" })
    .nonempty("First name cannot be empty"),
  lastName: z
    .string({ required_error: "lastName is required" })
    .nonempty("Last name cannot be empty"),
  email: z
    .string({ required_error: "email is required" })
    .email("Invalid email format"),
  phone: z.number({ required_error: "phone is required" }),
  taxId: z.string().optional(),
  clientFirmName: z.string().optional(),
  address: addressSchema,
  client_id: z.string().optional(),
});

const firmSchema = z.object({
  name: z
    .string({ required_error: "firm name is required" })
    .nonempty("Firm name cannot be empty"),
  phone: z.number().optional(),
  taxId: z.string().optional(),
  address: addressSchema.partial(), // making firm address optional
  firmId: z.string(),
  email: z
    .string({ required_error: "firm email is required" })
    .nonempty("Firm email cannot be empty"),
  logo: z.string().optional(),
});

const itemSchema = z.object({
  itemName: z
    .string({ required_error: "itemName is required" })
    .nonempty("Item name cannot be empty"),
  unitPrice: z.number({ required_error: "unitPrice is required" }),
  quantity: z.number({ required_error: "quantity is required" }),
  amount: z.number().optional(),
  hsn: z.string().optional(),
  sac: z.string().optional(),
  taxRate: z.number({ required_error: "taxRate is required" }),
  desc: z.string().optional(),
  discount: z.number().optional(),
});

const paymentSchema = z.object({
  amountPaid: z.number().optional(),
  datePaid: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  transId: z.string().optional(),
  notes: z.string().optional(),
  chequeNo: z.number().optional(),
});

const recurringInvoiceObjSchema = z.object({
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const invoiceSchema = z.object({
  items: z.array(itemSchema, { required_error: "items is required" }).min(1),
  gstn: z.string().optional(),
  notes: z.string().optional(),
  remark: z.string().optional(),
  client: clientSchema,
  tax: z.array(z.any()).optional(),
  taxAmt: z.array(z.any()).optional(),
  subTotal: z.number({ required_error: "subTotal is required" }),
  total: z.number({ required_error: "total is required" }),
  invoiceDate: z.coerce.date({ required_error: "invoiceDate is required" }),
  dueDate: z.coerce.date({ required_error: "dueDate is required" }),
  status: z
    .enum(["Pending", "Paid", "Overdue", "Partial Paid", "Draft", "Canceled"], {
      required_error: "status is required",
    })
    .default("Draft"),
  amountPaid: z.number().optional(),
  dueAmount: z.number().optional(),
  delete: z.boolean().optional(),
  roundOff: z.number().optional(),
  cancel: z.boolean().optional(),

  firm: firmSchema,
  payment: z.array(paymentSchema).optional(),
  recurringInvoiceObj: recurringInvoiceObjSchema.optional(),
  termsNcondition: z.array(z.string()).optional(),
  currency: z.string().optional(),
  curConvert: z.string().optional(),
  incluTax: z.boolean().optional(),
  partialPay: z.boolean().optional(),
  allowTip: z.boolean().optional(),
  recurringInvoice: z.boolean().optional(),
  draft: z.boolean().optional(),
  orgId: z.string().optional(),
});
