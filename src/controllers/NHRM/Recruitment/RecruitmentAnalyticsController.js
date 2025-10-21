import RecruitmentAnalytics from "../../../models/NHRM/Recruitement/recruitmentAnalytics.js";
import JobPosting from "../../../models/NHRM/Recruitement/jobPostings.js";
import Candidate from "../../../models/NHRM/Recruitement/candidateTracking.js";
import Interview from "../../../models/NHRM/Recruitement/interviewScheduling.js";
import Offer from "../../../models/NHRM/Recruitement/offerManagement.js";

// Generate / Update Analytics for a Job Posting
export const generateAnalytics = async (req, res) => {
  try {
    const { jobPostingId } = req.params;

    // Ensure job posting exists
    const jobPosting = await JobPosting.findById(jobPostingId);
    if (!jobPosting) return res.status(404).json({ message: "Job posting not found" });

    // Aggregate metrics
    const totalApplicants = await Candidate.countDocuments({ jobApplication: jobPostingId });
    const totalInterviews = await Interview.countDocuments({ jobPosting: jobPostingId });
    const totalOffers = await Offer.countDocuments({ jobPosting: jobPostingId });
    const totalHires = await Candidate.countDocuments({ jobApplication: jobPostingId, status: "Hired" });

    const offerConversionRate = totalApplicants ? (totalOffers / totalApplicants) * 100 : 0;
    const hireConversionRate = totalApplicants ? (totalHires / totalApplicants) * 100 : 0;

    // Source breakdown
    const sourceAggregation = await Candidate.aggregate([
      { $match: { jobApplication: jobPosting._id } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    const sourceBreakdown = {
      LinkedIn: 0,
      Referral: 0,
      Other: 0,
    };

    sourceAggregation.forEach((s) => {
      sourceBreakdown[s._id] = s.count;
    });

    // Upsert analytics document
    const analytics = await RecruitmentAnalytics.findOneAndUpdate(
      { jobPosting: jobPostingId },
      {
        jobPosting: jobPostingId,
        totalApplicants,
        totalInterviews,
        totalOffers,
        totalHires,
        offerConversionRate,
        hireConversionRate,
        sourceBreakdown,
        updatedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Analytics generated/updated", analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Analytics by Job Posting
export const getAnalyticsByJob = async (req, res) => {
  try {
    const { jobPostingId } = req.params;

    const analytics = await RecruitmentAnalytics.findOne({ jobPosting: jobPostingId }).populate("jobPosting");
    if (!analytics) return res.status(404).json({ message: "Analytics not found for this job posting" });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Analytics (optionally filtered by organization)
export const getAllAnalytics = async (req, res) => {
  try {
    const { organizationId } = req.query;

    let filter = {};
    if (organizationId) {
      filter = { "jobPosting.organizationId": organizationId };
    }

    const analytics = await RecruitmentAnalytics.find(filter)
      .populate("jobPosting")
      .sort({ updatedAt: -1 });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Analytics
export const deleteAnalytics = async (req, res) => {
  try {
    const { analyticsId } = req.params;
    const deleted = await RecruitmentAnalytics.findByIdAndDelete(analyticsId);
    if (!deleted) return res.status(404).json({ message: "Analytics not found" });

    res.json({ message: "Analytics deleted", analytics: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
