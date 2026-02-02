import { z } from "zod";

/**
 * Shared enums
 */
const accrualTypeEnum = z.enum(["MONTHLY", "YEARLY"]);

/**
 * CREATE LeaveType schema
 */
export const createLeaveTypeSchema = z
  .object({
    name: z.string().min(2).max(50),
    code: z.string().min(2).max(10).transform((v) => v.toUpperCase()),
    isPaid: z.boolean(),

    annualAllocation: z.number().min(0).nullable().optional(),

    allowHalfDay: z.boolean().optional(),

    accrualType: accrualTypeEnum.optional(),

    monthlyAccrual: z.number().min(0).optional(),

    maxCarryForward: z.number().min(0).optional(),

    allowEncashment: z.boolean().optional(),

    maxEncashable: z.number().min(0).optional()
  })
  .superRefine((data, ctx) => {
    /* Paid leave rules */
    if (data.isPaid && data.annualAllocation == null) {
      ctx.addIssue({
        path: ["annualAllocation"],
        message: "Paid leave must have annualAllocation",
        code: z.ZodIssueCode.custom
      });
    }

    if (!data.isPaid && data.annualAllocation != null) {
      ctx.addIssue({
        path: ["annualAllocation"],
        message: "Unpaid leave cannot have annualAllocation",
        code: z.ZodIssueCode.custom
      });
    }

    /* Monthly accrual rules */
    if (data.accrualType === "MONTHLY" && (!data.monthlyAccrual || data.monthlyAccrual <= 0)) {
      ctx.addIssue({
        path: ["monthlyAccrual"],
        message: "monthlyAccrual must be > 0 for MONTHLY accrual",
        code: z.ZodIssueCode.custom
      });
    }

    /* Encashment rules */
    if (data.allowEncashment && (!data.maxEncashable || data.maxEncashable <= 0)) {
      ctx.addIssue({
        path: ["maxEncashable"],
        message: "maxEncashable must be > 0 when encashment is allowed",
        code: z.ZodIssueCode.custom
      });
    }
  });

/**
 * UPDATE LeaveType schema
 * - Blocks dangerous fields
 */
export const updateLeaveTypeSchema = createLeaveTypeSchema
  .partial()
  .omit({
    code: true,
    isPaid: true
  });
