import { z } from "zod";

/* ------------------------------------------------------------------ */
/* 1.  Enums – keep them in one place                                 */
/* ------------------------------------------------------------------ */
const STAGE_ENUM = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed-Won",
  "Closed-Lost"
]

const PRIORITY_ENUM = ["Low", "Medium", "High", "Critical"]
const SOURCE_ENUM = [
  "Website",
  "Referral",
  "Social Media",
  "Advertisement",
  "Event",
  "Cold Call",
  "Other"
] 

const NEXT_ACTION_ENUM = [
  "Call",
  "Email",
  "Meeting",
  "Send Proposal",
  "Follow Up",
  "Close"
]

/* ------------------------------------------------------------------ */
/* 2.  Sub-schemas                                                    */
/* ------------------------------------------------------------------ */
const interactionSchema = z.object({
  type:      z.enum(["call", "email", "meeting", "note"]),
  summary:   z.string().optional(),
  details:   z.string().optional(),
  date:      z.coerce.date().optional(),
  participants: z.array(
    z.object({
      userId: z.string(), // ObjectId as string
      role:   z.string().optional()
    })
  ).optional()
});

const stageHistorySchema = z.object({
  stage:      z.enum(STAGE_ENUM),
  enteredAt:  z.coerce.date().optional(),
  exitedAt:   z.coerce.date().optional(),
  reason:     z.string().optional()
});

/* ------------------------------------------------------------------ */
/* 3.  Core create  (POST /leads)                                     */
/* ------------------------------------------------------------------ */
export const createLeadSchema = z.object({
  title:       z.string({required_error:"tilte is required"}).min(1, "Title is required"),
  description: z.string().optional(),
<<<<<<< HEAD
firm:z.string({required_error:"frim id is required"}).min(1).nonempty(),
  contact: z.object({
    name:    z.string({required_error:"contact name required"}).min(1, "Contact name is required"),
    email:   z.string({required_error:"email required"}).email("Invalid email"),
    phone:   z.string().optional(),
    company: z.string().optional(),
    position:z.string().optional()
=======

  // Client Info
  client: z.object({
    firstName: z
      .string({ required_error: " first name is required" })
      .min(1)
      .nonempty("First name cannot be empty"),
    lastName: z
      .string({ required_error: "last name is required" })
      .min(1)
      .nonempty("Last name cannot be empty"),
    email: z
      .string()
      .email({ required_error: " email is required" })
      .nonempty("Email cannot be empty"), // email validation
    phone: z.string({ required_error: " phone is required" }),
    address: z
      .object({
        line1: z.string({ required_error: " address line 1 is required" }),
        line2: z.string({ required_error: " address line 2 is required" }),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string({ required_error: " country is required" }),
        postalCode: z.string({ required_error: " postal code is required" }),
      })
      .optional(),
>>>>>>> project
  }),

  source:        z.enum(SOURCE_ENUM),
  sourceDetails: z.string().optional(),
  

  stage:   z.enum(STAGE_ENUM).default("New"),
  estimatedValue: z.number().min(0).optional(),
  currency:       z.string().default("INR"),

<<<<<<< HEAD
  assignedTo:   z.string().optional(),       
  assignedAt:   z.coerce.date().optional(),
=======
  // Assignment
  leadManagerId: z.string().optional(), // ObjectId as string
  assignedToId: z.string().optional(), // ObjectId as string
 
  firmId: z.string({required_error:"firm id required"}),
  // Pipeline Info
  pipeline: z
    .object({
      department: z.string().optional(),
      userType: z.string().optional(),
    })
    .optional(),
>>>>>>> project


  nextAction:     z.enum(NEXT_ACTION_ENUM).optional(),
  nextActionDate: z.coerce.date().optional(),
  priority:       z.enum(PRIORITY_ENUM).default("Medium"),

  interactions: z.array(interactionSchema).optional(),
  notes:        z.array(z.string()).optional(),
  tags:         z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional()
});

/* ------------------------------------------------------------------ */
/* 4.  Update  (PATCH /leads/:id)                                     */
/* ------------------------------------------------------------------ */
export const updateLeadSchema = createLeadSchema.partial().extend({
  isActive: z.boolean().optional(),
   createClient: z.boolean().default(false),
  deletedAt: z.coerce.date().optional()
});

/* ------------------------------------------------------------------ */
/* 5.  Update stage only (PATCH /leads/:id/stage)                     */
/* ------------------------------------------------------------------ */
export const updateLeadStageSchema = z.object({
  stage:   z.enum(STAGE_ENUM),
  reason:  z.string().optional(),
  createClient: z.boolean().default(false),   // <-- NEW
});