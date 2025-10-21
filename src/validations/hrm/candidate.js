import { z } from "zod";

// 🔹 Feedback Schema
const feedbackSchema = z.object({
    givenBy: z.string().optional(), // Mongo ObjectId as string
    comment: z.string().trim().optional(),
    rating: z.number().min(1).max(5).optional(),
    stage: z.enum(["Screening", "Interview", "Offer", "Final"]).optional(),
});


// 🔹 Candidate Schema
export const candidateSchema = z.object({
    // 🧍 Basic Info
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),
    phoneNumber: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")), // optional but can be empty
    location: z.string().trim().min(1, "Location is required"),
    linkedInProfile: z
        .string()
        .trim()
        .url("LinkedIn profile must be a valid URL")
        .min(1, "LinkedIn profile is required"),
    portfolio: z.string().trim().url().optional(),
    resume: z.string().trim().url("Resume must be a valid URL").min(1, "Resume is required"),
    coverLetter: z.string().trim().url().optional(),

    // 🧩 Application Details
    jobApplication: z.string().min(1, "Job application ID is required"),
    source: z
        .enum(["LinkedIn", "Indeed", "Referral", "Walk-in", "Other"])
        .default("Other"),
    referral: z.string().optional(),

    // 🧠 Evaluation Data
    skills: z
        .array(z.string().trim().min(1))
        .nonempty("At least one skill is required"),
    experience: z
        .number({ invalid_type_error: "Experience must be a number" })
        .min(0, "Experience must be positive"),
    education: z.string().trim().min(1, "Education is required"),
    expectedSalary: z
        .number({ invalid_type_error: "Expected salary must be a number" })
        .min(0, "Expected salary must be positive"),
    currentSalary: z
        .number({ invalid_type_error: "Current salary must be a number" })
        .min(0, "Current salary must be positive"),
    noticePeriod: z.string().trim().min(1, "Notice period is required"),
    feedback: z.array(feedbackSchema).optional(),

    // 🗓️ Recruitment Progress
    status: z
        .enum([
            "Applied",
            "Screening",
            "Shortlisted",
            "Interview Scheduled",
            "Interview Completed",
            "Offered",
            "Rejected",
            "Hired",
        ])
        .default("Applied"),

    offer: z.string().optional(),
    employeeProfile: z.string().optional(),

    // 🧾 System & Audit Fields
    appliedDate: z.date().optional(),
    lastUpdated: z.date().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
    isArchived: z.boolean().default(false),
    notes: z.array(z.string().trim()).optional(),

    // ⚙️ Metadata for Tracking
    tags: z.array(z.string().trim()).optional(),
    rating: z.number().min(1).max(5).optional(),
    resumeScore: z.number().min(0).max(100).optional(),
});

// Partial update schema, omit fields that should not be updated
export const updateCandidateSchema = candidateSchema
    .partial() // make all fields optional
    .omit({
        email: true,       // email cannot be updated
        appliedDate: true, // system-managed
        createdBy: true,   // system-managed
    });