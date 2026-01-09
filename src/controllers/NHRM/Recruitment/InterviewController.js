import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { Interview } from "../../../models/NHRM/Recruitement/interviewScheduling.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js"
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
// Create a new Interview
export const createInterview = async (req, res) => {
  try {
    const {
      candidate,
      jobPosting,
      interviewer,
      scheduledDate,
      interviewType,
      panel,
      status,
      feedbacks,
      followUp,
    } = req.body;
    const orgId = req.orgUser.orgId
    // List of required fields
    const requiredFields = {
      candidate,
      jobPosting,
      interviewer,
      scheduledDate,
      interviewType,
    };

    // Check for missing fields
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(', ')}`,
      });
    }

    // Validate interviewType enum
    const validTypes = ['Phone', 'Video', 'In-person'];
    if (!validTypes.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid interviewType. Allowed values: ${validTypes.join(', ')}`,
      });
    }

    // Validate status enum (if provided)
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    // Validate feedbacks (if provided)
    if (feedbacks && !Array.isArray(feedbacks)) {
      return res.status(400).json({
        success: false,
        message: 'feedbacks must be an array',
      });
    }

    // 🔥 Parallel DB existence checks
    const [candidateExist, jobPostingExist, interviewerExist] = await Promise.all([
      Candidate.findById(candidate).lean(),
      JobPosting.findById(jobPosting).lean(),
      EmployeeProfile.findById(interviewer).lean(),
    ]);
    if (!interviewerExist) {
      return res.status(404).json({
        success: false,
        message: 'EmployeeProfile not found',
      });
    }
    if (!candidateExist) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }
    if (!jobPostingExist) {
      return res.status(404).json({
        success: false,
        message: 'JobPosting not found',
      });
    }
    // Build the interview object
    const interview = new Interview({
      organization: orgId,
      candidate,
      jobPosting,
      interviewer,
      scheduledDate,
      interviewType,
      panel: panel || [],
      status: status || 'Scheduled',
      feedbacks: feedbacks || [],
      followUp: followUp || '',
    });

    const savedInterview = await interview.save();

    // Link interview to candidate
    await Candidate.findByIdAndUpdate(candidate, {
      $push: { interviews: savedInterview._id },
      status: 'Interview Scheduled',
    });


    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: savedInterview,
    });
  } catch (err) {
    logger.error('Interview creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling interview',
      error: err.message,
    });
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

    const orgId = req.orgUser.orgId
    // Fetch interview first
    if(!interviewId) return res.status(400).json({ success: false, message: 'Interview ID is required' });
    const interview = await Interview.findOne({ _id: interviewId, organization: orgId });
    if (!interview)
      return res.status(404).json({ success: false, message: 'Interview not found' });

    // Restrict deletion to completed or cancelled
    if (!['Completed', 'Cancelled'].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete interview with status '${interview.status}'. Only 'Completed' or 'Cancelled' interviews can be deleted.`,
      });
    }

    // Proceed to delete
    const deletedInterview = await Interview.findByIdAndDelete(interviewId);

    // Remove reference from candidate
    await Candidate.findByIdAndUpdate(interview.candidate, {
      $pull: { interviews: interviewId },
    });

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully',
      interview: deletedInterview,
    });
  } catch (err) {
    logger.error('Delete interview error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting interview',
      error: err.message,
    });
  }
};

// Get all Interviews (with optional filters)
export const getInterviews = async (req, res) => {
  try {
    const { jobId, status, interviewerId, page = 1, limit = 20 } = req.query;
    const { orgId } = req.orgUser;

    const filter = { organization: orgId };

    if (jobId) filter.jobPosting = jobId;
    if (interviewerId) filter.interviewer = interviewerId;

    if (status) {
      const validStatuses = ["Scheduled", "Completed", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed: ${validStatuses.join(", ")}`,
        });
      }
      filter.status = status;
    }

    const currentPage = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (currentPage - 1) * limitNum;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate({ path: "candidate", select: "firstName lastName email" })
        .populate({ path: "jobPosting", select: "title department" })
        .populate({ path: "interviewer", select: "firstName lastName email" })
        .populate({ path: "panel", select: "firstName lastName" })
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Interview.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: "Interviews fetched successfully",
      count: interviews.length,
      interviews,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage,
        limit: limitNum,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
      },
    });

  } catch (err) {
    logger.error("Error fetching interviews:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching interviews",
      error: err.message,
    });
  }
};


// Get single Interview
export const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const orgId = req.orgUser.orgId
    if(!interviewId) return res.status(400).json({ success: false, message: 'Interview ID is required' });
    const interview = await Interview.findOne({ _id: interviewId, organization: orgId })
      .populate({
        path: 'candidate',
        select: 'firstName lastName email phone status',
      })
      .populate({
        path: 'jobPosting',
        select: 'title department location',
      })
      .populate({
        path: 'interviewer',
        select: 'firstName lastName email position',
      })
      .populate({
        path: 'panel',
        select: 'firstName lastName email position',
      })
      .lean();

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // If panel has IDs but no populated details (edge case safeguard)
    if (interview.panel && interview.panel.length > 0 && typeof interview.panel[0] === 'string') {
      const panelDetails = await EmployeeProfile.find({
        _id: { $in: interview.panel },
      }).select('firstName lastName email position').lean();

      interview.panel = panelDetails;
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (err) {
    logger.error('Error fetching interview:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview',
      error: err.message,
    });
  }
};

// Update Interview Feedback and Status
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { interviewerId, comments, rating } = req.body;
    const orgId = req.orgUser.orgId
    if (!interviewerId || !comments || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: interviewerId, comments, rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const interview = await Interview.findOne({ _id: interviewId, organization: orgId });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Check if this interviewer has already provided feedback
    const existingFeedback = interview.feedbacks.find(
      (fb) => fb.interviewer.toString() === interviewerId
    );

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.comments = comments;
      existingFeedback.rating = rating;
      existingFeedback.createdAt = Date.now();
    } else {
      // Push new feedback
      interview.feedbacks.push({
        interviewer: interviewerId,
        comments,
        rating,
      });
    }

    interview.updatedAt = Date.now();

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview feedback updated successfully',
      interview,
    });
  } catch (err) {
    logger.error('Feedback update error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating feedback',
      error: err.message,
    });
  }
};

export const updateInterviewStatus = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { status } = req.body;
    const { orgId } = req.orgUser;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: "Interview ID is required" });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const validStatuses = ["Scheduled", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    // Fetch interview with org check
    const interview = await Interview.findOne({ _id: interviewId, organization: orgId });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or access denied" });
    }

    // Prevent invalid transitions
    const currentStatus = interview.status;
    if (currentStatus === "Completed" && status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a completed interview",
      });
    }

    if (currentStatus === "Cancelled" && status !== "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify a cancelled interview",
      });
    }

    interview.status = status;
    interview.updatedAt = Date.now();
    await interview.save();

    res.status(200).json({
      success: true,
      message: `Interview status updated to '${status}'`,
      interview,
    });
  } catch (err) {
    logger.error("Error updating interview status:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating interview status",
      error: err.message,
    });
  }
};
