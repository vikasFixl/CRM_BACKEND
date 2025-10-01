// validators/billingPlan.validator.js
import { z } from "zod";

const PricingSchema = z.object({
  currency: z.string()
    .length(3, "Currency must be a valid 3-letter ISO code (e.g., USD, INR)")
    .toUpperCase(),
  amount: z.number().min(0, "Amount cannot be negative"),
  strikethroughAmount: z.number().min(0).optional(),
  billingCycle: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
}).refine((data) => {
  // Validate sibling relationship
  return data.strikethroughAmount == null || data.strikethroughAmount > data.amount;
}, {
  message: "Strikethrough amount must be greater than base amount",
  path: ["strikethroughAmount"], // points error to this field
});


const FeatureSchema = z.object({
  title: z.string().min(1, "Feature title is required"),
  description: z.string().optional(),
  isHighlight: z.boolean().default(false),
  isAddOn: z.boolean().default(false),
});

const TrialSchema = z.object({
  isTrialAvailable: z.boolean().default(false),
  trialDays: z.number().min(0).max(90).default(0),
});

export const BillingPlanValidator = z.object({
  name: z.string().min(3).max(50),
  code: z.string().min(2).max(20).toUpperCase(),
  description: z.string().max(500).optional(),
  planType: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]),
  pricing: z.array(PricingSchema).min(1, "At least one pricing option is required"),
  features: z.array(FeatureSchema).min(1, "At least one feature is required"),
  modules: z.array(z.string().toLowerCase()).optional(),
  limits: z.object({
    maxUsers: z.number().min(1).nullable().optional(),
    maxProjects: z.number().min(1).nullable().optional(),
    maxProjectMembers: z.number().min(1).nullable().optional(),
    maxStorageGB: z.number().min(1).nullable().optional(),
  }).optional(),
  trial: TrialSchema.optional(),
  isActive: z.boolean().default(true),
  isFreePlan: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  regionRestrictions: z.array(z.string().toUpperCase()).optional(),
  tags: z.array(z.string()).optional(),
});
