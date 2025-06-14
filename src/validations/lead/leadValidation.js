import { z } from "zod";


const interactionSchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "other"]),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  createdBy: z.string().optional(), // ObjectId (as string)
});

const stageHistorySchema = z.object({
  stageName: z.string(),enum:[  "New",
  "Contacted",
  "Qualified",
  "Demo",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
  "Converted"],
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
});

export const leadSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),

  // Client Info
  client: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
  }),

  // Financial Info
  estimatedWorth: z.number().optional(),
  currency: z.string().default("INR"),

  // Stage & Status
   stage: z.enum(["New", "Contacted", "Qualified", "ProposalSent",  "Negotiation","Lead Closed"]),
  stageHistory: z.array(stageHistorySchema).optional(),
  status: z.enum(["New",  "Won", "Lost", "Hold"]).optional(),

  // Assignment
  leadManagerId: z.string().optional(), // ObjectId as string
  assignedToId: z.string().optional(),  // ObjectId as string
  orgId: z.string().min(1, "Org ID is required").optional(),
 // Org/Firm
  firmId: z.string().optional(),   
  // Pipeline Info
  pipeline: z.object({
    department: z.string().optional(),
    userType: z.string().optional(),
  }).optional(),

                

  // Tracking
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  closureDate: z.coerce.date().optional(),

  // Interactions/Notes
  interactions: z.array(interactionSchema).optional(),
  notes: z.string().optional(),

  // Lead Intelligence
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  leadScore: z.number().min(0).max(100).optional(),
  followUpDate: z.coerce.date().optional(),

  nextAction: z.enum([
    "Call Lead",
    "Send Email",
    "Schedule Meeting",
    "Demo",
    "Send Proposal",
    "Negotiate",
    "Close Deal",
    "Follow Up Later",
    "Collect Documents",
    "Other"
  ]).optional(),

  customNextAction: z.string().optional(),

  // Custom Fields
  customFields: z.record(z.string()).optional(),

  // Soft delete
  deleted: z.boolean().default(false),

  // Random ID
  randomLeadId: z.number().optional(),
});


export const updateLeadSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),

  client: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z
        .object({
          line1: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          postalCode: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  estimatedWorth: z.number().optional(),
  currency: z.string().optional(),

  status: z
    .enum(["New",  "Won", "Lost", "Hold"])
    .optional(),

  pipeline: z
    .object({
      department: z.string().optional(),
      userType: z.string().optional(),
    })
    .optional(),

  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  closureDate: z.coerce.date().optional(),
  followUpDate: z.coerce.date().optional(),

  priority: z
    .enum(["Low", "Medium", "High", "Critical"])
    .optional(),

  leadScore: z.number().min(0).max(100).optional(),

  nextAction: z
    .enum([
      "Call Lead",
      "Send Email",
      "Schedule Meeting",
      "Demo",
      "Send Proposal",
      "Negotiate",
      "Close Deal",
      "Follow Up Later",
      "Collect Documents",
      "Other",
    ])
    .optional(),

  customNextAction: z.string().optional(),
  notes: z.string().optional(),

  firmId: z.string().optional(),
  assignedToId: z.string().optional(),
  leadManagerId: z.string().optional(),
}).strict(); // disallow unknown fields like `stage`



 export const updateLeadStageSchema = z.object({
  stage: z.enum(
    [
      "New",
      "Contacted",
      "Qualified",
      "Demo",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost",
      "Converted",
    ]
  )
});