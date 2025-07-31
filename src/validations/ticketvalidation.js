import { z } from 'zod';

export const MODULES = {
  LEAD: "lead",
  CLIENT: "client",
  FIRM: "firm",
  USER: "user",
  INVOICE: "invoice",
  PROJECT: "project",
  OTHER: "other",
} ;

export const TicketStatusEnum = z.enum([
  'open',
  'in_progress',
  'on_hold',
  'resolved',
  'closed',
  'cancelled'
]);

export const TicketPriorityEnum = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
]);

export const TicketTypeEnum = z.enum([
  'bug',
  'feature_request',
  'question',
  'task',
  'incident'
]);

export const TicketModuleEnum = z.enum([
  'lead',
  'client',
  'firm',
  'user',
  'invoice',
  'project',
  'other'
]);

// 🎫 Ticket Create Schema
export const createTicketSchema = z.object({
  module: TicketModuleEnum,
  title: z.string({ required_error: 'Title is required' }).min(1, 'Title is required'),
  description: z.string({ required_error: 'Description is required' }).min(1, 'Description is required'),
  status: TicketStatusEnum.optional(), // defaults to open
  priority: TicketPriorityEnum.optional(), // defaults to medium
  type: TicketTypeEnum,
  tags: z.array(z.string()).optional(),
 
});



// 🔁 Status-only update
export const updateTicketStatusSchema = z.object({
  
  status: TicketStatusEnum,
});
