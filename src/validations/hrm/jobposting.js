import { z } from "zod";

export const createJobPostingSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is required and must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    qualifications: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    department: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid department ID"),
    location: z.string().min(2, "Location is required."),
    employmentType: z.enum(["Full-Time", "Part-Time", "Contract", "Internship"]).default("Full-Time"),
    tags: z.array(z.string()).optional(),
    closingDate: z.string().datetime().optional(),
  }),
});

export const updateJobPostingSchema = z.object({
  body: z
    .object({
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      qualifications: z.array(z.string()).optional(),
      responsibilities: z.array(z.string()).optional(),
      location: z.string().optional(),
      employmentType: z.enum(["Full-Time", "Part-Time", "Contract", "Internship"]).optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["Open", "Closed", "Filled"]).optional(),
      closingDate: z.string().datetime().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be updated",
    }),
  params: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
  }),
});

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors.map((e) => e.message),
    });
  }
};
