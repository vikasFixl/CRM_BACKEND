import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js";
import { RecruitmentAnalytics } from "../../../models/NHRM/Recruitement/recruitmentAnalytics.js";
// Create a new Job Posting
import mongoose from "mongoose";

export const createJobPosting = async (req, res) => {
  const { userId } = req.user
  const orgId = req.orgUser.orgId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { title, description, qualifications, responsibilities, department, location, employmentType, tags, closingDate } = req.body;

    if (!title || !description || !department || !location)
      return res.status(400).json({ error: "Missing required fields" });

    const existingJob = await JobPosting.findOne({ title, department, status: "Open" });
    if (existingJob) return res.status(409).json({ error: "Duplicate open job posting" });

    const job = new JobPosting({
      organization: orgId,
      title,
      description,
      qualifications,
      responsibilities,
      department,
      location,
      employmentType,
      tags,
      closingDate,
      createdBy: userId,
    });

    const savedJob = await job.save({ session });

    // create analytics record
    await RecruitmentAnalytics.create([{ jobPosting: savedJob._id }], { session });

    await session.commitTransaction();
    res.status(201).json({ message: "Job posting created successfully", job: savedJob });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};


// Update Job Posting
export const updateJobPosting = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Pick only allowed fields to update
    const allowedUpdates = [
      "title",
      "description",
      "qualifications",
      "responsibilities",
      "department",
      "location",
      "employmentType",
      "tags",
      "closingDate",
    ];

    const updates = {};
    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updatedJob = await JobPosting.findByIdAndUpdate(jobId, updates, { new: true });
    if (!updatedJob) return res.status(404).json({ message: "Job Posting not found" });

    res.json({ message: "Job Posting updated", job: updatedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete Job Posting
export const deleteJobPosting = async (req, res) => {
  try {
    const { jobId } = req.params;
    const deletedJob = await JobPosting.findByIdAndDelete(jobId);
    if (!deletedJob) return res.status(404).json({ message: "Job Posting not found" });

    // Optionally archive linked candidates
    await Candidate.updateMany({ jobApplication: jobId }, { isArchived: true });

    res.json({ message: "Job Posting deleted", job: deletedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Job Postings (filter optional)
export const getJobPostings = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { department, status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { organization: orgId, status: "Open" };
    if (department) filter.department = department;
    if (status) filter.status = status;

    // Convert page/limit to integers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit)); // prevent huge queries
    // Calculate if next page exists

    // Query with populate only needed fields and lean for performance
    const jobs = await JobPosting.find(filter)
      .populate("department", "name") // only get department name
      .populate("createdBy", "email") // only get department name
      .sort({ postedDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .select("-organization")
      .limit(limitNum)
      .lean();

    // Optional: total count for pagination
    const total = await JobPosting.countDocuments(filter);
    const hasNextPage = pageNum * limitNum < total;
    res.json({
      message: "Job postings fetched",
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        hasNextPage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get single Job Posting
export const getJobPosting = async (req, res) => {
  try {
    const { orgId } = req.orgUser
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const job = await JobPosting.findOne({ _id: jobId, organization: orgId })
      .populate("department", "name")
      .populate("applications", "name email status") // only fetch necessary fields
      .lean();

    if (!job) return res.status(404).json({ message: "Job Posting not found" });

    res.json({ message: "Job fetched successfully", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Close a Job Posting
export const closeJobPosting = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await JobPosting.findByIdAndUpdate(jobId, { status: "Closed" }, { new: true });
    if (!job) return res.status(404).json({ message: "Job posting not found" });

    res.json({ message: "Job posting closed", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};