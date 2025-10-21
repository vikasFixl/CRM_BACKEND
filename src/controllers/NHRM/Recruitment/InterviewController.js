import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { Interview } from "../../../models/NHRM/Recruitement/interviewScheduling.js";

// Create a new Interview
export const createInterview = async (req, res) => {
  try {
    const { candidateId, jobPosting, interviewer, scheduledDate, interviewType, panel } = req.body;

    const interview = new Interview({
      candidate: candidateId,
      jobPosting,
      interviewer,
      scheduledDate,
      interviewType,
      panel,
      status: "Scheduled",
    });

    const savedInterview = await interview.save();

    // Link interview to candidate
    await Candidate.findByIdAndUpdate(candidateId, { $push: { interviews: savedInterview._id }, status: "Interview Scheduled" });

    res.status(201).json({ message: "Interview scheduled", interview: savedInterview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Interview details (reschedule, change type, panel)
export const updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const updatedInterview = await Interview.findByIdAndUpdate(interviewId, req.body, { new: true });
    if (!updatedInterview) return res.status(404).json({ message: "Interview not found" });

    res.json({ message: "Interview updated", interview: updatedInterview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Interview
export const deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const deletedInterview = await Interview.findByIdAndDelete(interviewId);
    if (!deletedInterview) return res.status(404).json({ message: "Interview not found" });

    // Remove reference from candidate
    await Candidate.findByIdAndUpdate(deletedInterview.candidate, { $pull: { interviews: interviewId } });

    res.json({ message: "Interview deleted", interview: deletedInterview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Interviews (with optional filters)
export const getInterviews = async (req, res) => {
  try {
    const { jobId, status, interviewerId } = req.query;
    const filter = {};
    if (jobId) filter.jobPosting = jobId;
    if (status) filter.status = status;
    if (interviewerId) filter.interviewer = interviewerId;

    const interviews = await Interview.find(filter)
      .populate("candidate")
      .populate("jobPosting")
      .populate("interviewer")
      .populate("panel")
      .sort({ scheduledDate: 1 });

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Interview
export const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId)
      .populate("candidate")
      .populate("jobPosting")
      .populate("interviewer")
      .populate("panel");

    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Interview Feedback and Status
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { feedback, rating, status } = req.body;

    const updated = await Interview.findByIdAndUpdate(interviewId, { feedback, rating, status, updatedAt: Date.now() }, { new: true });
    if (!updated) return res.status(404).json({ message: "Interview not found" });

    res.json({ message: "Interview feedback updated", interview: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
