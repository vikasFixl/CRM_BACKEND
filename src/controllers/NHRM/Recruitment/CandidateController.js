import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { Offer } from "../../../models/NHRM/Recruitement/offerManagement.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js";
import { Interview } from "../../../models/NHRM/Recruitement/interviewScheduling.js";
import { candidateSchema, updateCandidateSchema } from "../../../validations/hrm/candidate.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import { generateEmployeeCode, generateTempPassword } from "../../../utils/helperfuntions/generateInviteCode.js";
import { sendEmail } from "../../../../config/nodemailer.config.js";
import { Position } from "../../../models/NHRM/employeeManagement/postition.js";
import logger from "../../../../config/logger.js";
// Create a new Candidate (HR adds manually)
// Example data (from form or file)
// export const createCandidates = async (req, res) => {
//   try {
//     const createdBy = req.user?._id; // HR creating candidate(s)
//     const body = req.body;

//     let candidates = [];

//     // Allow both single object or array
//     if (Array.isArray(body)) {
//       candidates = body;
//     } else if (body.candidate) {
//       candidates = [body.candidate];
//     } else {
//       candidates = [body];
//     }

//     if (!candidates.length)
//       return res.status(400).json({ success: false, message: "No candidates provided." });

//     // Format data
//     const formatted = candidates.map((c) => ({
//       ...c,
//       createdBy,
//       appliedDate: c.appliedDate || new Date(),
//       lastUpdated: new Date(),
//     }));

//     // Deduplicate by email
//     const emails = formatted.map((c) => c.email);
//     const existing = await Candidate.find({ email: { $in: emails } }, "email");
//     const existingEmails = new Set(existing.map((e) => e.email));

//     const newCandidates = formatted.filter((c) => !existingEmails.has(c.email));

//     if (!newCandidates.length)
//       return res.status(400).json({ success: false, message: "All candidates already exist." });

//     const inserted = await Candidate.insertMany(newCandidates);

//     return res.status(201).json({
//       success: true,
//       message: `${inserted.length} candidate(s) created successfully.`,
//       duplicates: [...existingEmails],
//       data: inserted,
//     });
//   } catch (err) {
//     logger.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
export const createCandidate = async (req, res) => {
  try {

    const validatedCandidate = candidateSchema.parse(req.body);

    // 2️⃣ Check for duplicate email
    const existing = await Candidate.findOne({ email: validatedCandidate.email });
    if (existing)
      return res.status(400).json({ message: "Candidate with this email already exists" });
    const jobpostingExit = await JobPosting.findOne({ _id: validatedCandidate.jobApplication, organization: req.orgUser.orgId, status: "Open" })
    if (!jobpostingExit) {
      return res.status(400).json({ message: "No Open Job Posting found" });
    }
    const stageEntry = {
      stage: validatedCandidate.status,
      changedAt: new Date(),
      changedBy: req.user?.userId,
    };
    // 3️⃣ Create Mongoose Candidate instance
    const newCandidate = new Candidate({
      ...validatedCandidate,
      stageHistory: [stageEntry],
      organization: req.orgUser.orgId,
      createdBy: req.user.userId,
    });

    // 4️⃣ Save candidate
    const savedCandidate = await newCandidate.save();


    res.status(201).json({ message: "Candidate created", candidate: savedCandidate });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
};

export const uploadCandidates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      return res.status(400).json({ success: false, message: "File is empty or invalid." });
    }

    // Validate required fields
    const validRows = sheetData.filter(
      (row) => row.firstName && row.lastName && row.email && row.jobApplication
    );

    if (validRows.length === 0) {
      return res.status(400).json({ success: false, message: "No valid rows found in file." });
    }

    // Map data into model
    const formattedCandidates = validRows.map((c) => ({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phoneNumber: c.phoneNumber || "",
      resume: c.resume || "",
      coverLetter: c.coverLetter || "",
      jobApplication: c.jobApplication,
      source: c.source || "Other",
      status: c.status || "Applied",
      createdBy: req.user?._id,
    }));

    const result = await Candidate.insertMany(formattedCandidates);
    res.json({
      success: true,
      message: `${result.length} candidates uploaded successfully.`,
      count: result.length,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Error processing file.", error: error.message });
  }
};
// Update Candidate info
export const updateCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // 1️⃣ Validate input with Zod
    const validatedData = updateCandidateSchema.parse(req.body);

    let candidate = await Candidate.findById(candidateId);
    // 2️⃣ Automatically update lastUpdated
    validatedData.lastUpdated = new Date();

    // 3️⃣ Handle array fields carefully (optional)
    // e.g., append new feedback instead of overwriting
    if (validatedData.feedback) {
      await Candidate.findByIdAndUpdate(
        candidateId,
        { $push: { feedback: { $each: validatedData.feedback } }, lastUpdated: validatedData.lastUpdated },
        { new: true }
      );


      return res.json({ message: "Candidate updated", candidate });
    }

    if (validatedData.status != candidate.status) {
      // create stage history entry
      const stageEntry = {
        stage: validatedData.status,
        changedAt: new Date(),
        changedBy: req.user?.userId,
      };
      await Candidate.findByIdAndUpdate(candidateId, { $push: { stageHistory: stageEntry } }, { new: true });
    }
    // 4️⃣ Regular update for other fields
    const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, validatedData, { new: true });

    if (!updatedCandidate) return res.status(404).json({ message: "Candidate not found" });

    res.json({ message: "Candidate updated", candidate: updatedCandidate });
  } catch (err) {
    // Zod validation errors
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Candidate
export const deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);
    if (!deletedCandidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Candidate deleted", candidate: deletedCandidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Candidates (filterable)
export const getCandidates = async (req, res) => {
  try {
    const { jobId, status, page = 1, limit = 10 } = req.query;
    const { orgId } = req.orgUser;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    /** 1️⃣ Build filter */
    const filter = { organization: orgId };
    if (jobId) filter.jobApplication = jobId;
    if (status) filter.status = status;

    /** 2️⃣ Query (LIGHTWEIGHT) */
    const candidates = await Candidate.find(filter)
      .select(
        "firstName lastName email phoneNumber status experience expectedSalary lastUpdated jobApplication interviews offer"
      )
      .populate({
        path: "jobApplication",
        select: "title"
      })
      .populate({
        path: "offer",
        select: "status"
      })
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    /** 3️⃣ Transform response */
    const formattedCandidates = candidates.map(c => ({
      _id: c._id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phoneNumber,
      status: c.status,
      experience: c.experience,
      expectedSalary: c.expectedSalary,
      jobTitle: c.jobApplication?.title || null,
      interviewCount: c.interviews?.length || 0,
      offerStatus: c.offer?.status || null,
      lastUpdated: c.lastUpdated
    }));

    /** 4️⃣ Pagination count */
    const totalCandidates = await Candidate.countDocuments(filter);
    const totalPages = Math.ceil(totalCandidates / limitNumber);

    return res.json({
      success: true,
      page: pageNumber,
      limit: limitNumber,
      totalCandidates,
      totalPages,
      candidates: formattedCandidates
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// Get single Candidate
export const getCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId)
      .populate("jobApplication")
      .populate("interviews")
      .populate("offer");

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Interview to Candidate
export const moveCandidateToInterviewStage = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { interviewId } = req.body;
    const { orgId } = req.orgUser;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "interviewId is required"
      });
    }

    // 1️⃣ Fetch candidate
    const candidate = await Candidate.findOne({
      _id: candidateId,
      organization: orgId
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // 2️⃣ Fetch interview
    const interview = await Interview.findOne({
      _id: interviewId,
      organization: orgId,
      candidate: candidateId
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found for this candidate"
      });
    }

    // 3️⃣ Prevent duplicate transition
    if (candidate.status === "Interview_Scheduled") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already in Interview Scheduled stage"
      });
    }

    // 4️⃣ Update candidate
    await Candidate.updateOne(
      { _id: candidateId },
      {
        status: "Interview_Scheduled",
        lastUpdated: new Date(),
        $addToSet: { interviews: interview._id }, // 🔒 no duplicates
        $push: {
          stageHistory: {
            stage: "Interview_Scheduled",
            changedAt: new Date(),
            changedBy: req.user.userId
          }
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Candidate moved to Interview Scheduled stage",
      interviewId: interview._id
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// Move Candidate to Offer
export const moveToOffer = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { orgId: organization } = req.orgUser;

    const {
      offerId,
      offerData,
      jobApplicationId,
      positionId
    } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // 1️⃣ Fetch candidate
    const candidate = await Candidate.findOne({ _id: candidateId, organization });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    let offer;

    // ============================
    // CASE 1: EXISTING OFFER
    // ============================
    if (offerId) {
      offer = await Offer.findById(offerId).populate("position");

      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      if (offer.candidate.toString() !== candidateId) {
        return res.status(400).json({
          message: "Offer does not belong to this candidate"
        });
      }
    }

    // ============================
    // CASE 2: CREATE NEW OFFER
    // ============================
    else {
      if (!offerData || !offerData.baseSalary) {
        return res.status(400).json({ message: "Incomplete offer data" });
      }

      if (!jobApplicationId || !positionId) {
        return res.status(400).json({
          message: "Job Application ID and Position ID are required"
        });
      }

      const jobApplication = await JobPosting.findById(jobApplicationId);
      if (!jobApplication) {
        return res.status(404).json({ message: "Job Application not found" });
      }

      const position = await Position.findById(positionId);
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }

      offer = await Offer.create({
        organization,
        candidate: candidateId,
        jobPosting: jobApplicationId,
        position: positionId,
        offerDate: new Date(),
        status: "Pending",
        offerDetails: {
          baseSalary: offerData.baseSalary,
          bonus: offerData.bonus || 0,
          currency: offerData.currency || "INR",
          payFrequency: offerData.payFrequency || "Monthly",
          benefits: offerData.benefits || [],
          jobTitle: offerData.jobTitle,
          location: offerData.location
        }
      });

      await offer.populate("position");
    }

    // ============================
    // UPDATE CANDIDATE
    // ============================
    candidate.status = "Offered";
    candidate.offer = offer._id;
    candidate.lastUpdated = new Date();
    await candidate.save();

    // ============================
    // SEND EMAIL
    // ============================
    await sendEmail({
      to: candidate.email,
      subject: "Your Offer Letter from Our Company",
      html: `
        <p>Hi ${candidate.firstName} ${candidate.lastName},</p>
        <p>We are excited to offer you the position of
        <strong>${offer.offerDetails.jobTitle}</strong>
        at <strong>${offer.offerDetails.location}</strong>.</p>

        <ul>
          <li>Base Salary: ${offer.offerDetails.currency}
            ${offer.offerDetails.baseSalary.toLocaleString()}</li>
          <li>Bonus: ${offer.offerDetails.currency}
            ${offer.offerDetails.bonus.toLocaleString()}</li>
          <li>Pay Frequency: ${offer.offerDetails.payFrequency}</li>
          <li>Benefits: ${offer.offerDetails.benefits.join(", ") || "N/A"}</li>
        </ul>

        <p>Please review and respond at your earliest convenience.</p>
        <p>Regards,<br/>HR Team</p>
      `
  });
    res.json({
      message: "Candidate moved to offer stage and email sent"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
    logger.error(err,"error in offer stage");
  }
};


export const moveToHired = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const {
      offerId,
      joiningDate,
      reportingManagerId,
      departmentId,
      positionId
    } = req.body;

    const hrId = req.user.userId;
    const organizationId = req.orgUser.orgId;

    /* 1️⃣ Fetch candidate */
    const candidate = await Candidate.findOne({
      _id: candidateId,
      organization: organizationId
    });

    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    if (candidate.status !== "Offered")
      return res.status(400).json({
        message: "Candidate must be in Offered stage to hire"
      });

    /* 2️⃣ Fetch & validate offer */
    let offer = await Offer.findOne({
      _id: offerId,
      candidate: candidate._id,
      organization: organizationId,
    }).populate("position");

    if (!offer)
      return res.status(404).json({
        message: "Valid accepted offer not found for candidate"
      });

    /* 3️⃣ Create Employee Profile (DRAFT) */
    const employeeCode = generateEmployeeCode();
    const tempPassword = generateTempPassword();

    const employee = await EmployeeProfile.create({
      organizationId,
      employeeCode,
      userId: null, // will be linked after first login
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phoneNumber,

      departmentId,
      positionId,
      reportingManagerId,

      joinDate: joiningDate,
      employmentType: "Permanent",
      workLocation:"Onsite",

      status: "Active",
      isActive: false, // becomes true after onboarding
      role: "Employee",

      salary: {
        ctc: offer.offerDetails.baseSalary,
        currency: offer.offerDetails.currency
      },

      createdBy: hrId
    });

    /* 4️⃣ Update candidate */
    candidate.status = "Hired";
    candidate.offer = offer._id;
    candidate.employeeProfile = employee._id;
    candidate.stageHistory.push({
      stage: "Hired",
      changedBy: hrId
    });
    offer.status="Accepted"
    await candidate.save();

    /* 5️⃣ Send onboarding email */
    await sendEmployeeWelcomeEmail({
      candidate,
      employee,
      offer,
      tempPassword
    });

    res.status(200).json({
      success: true,
      message: "Candidate hired successfully",
      employee
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
}
// controllers/candidateController.js

export const updateCandidateStatus = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status, offerId } = req.body;
    const organizationId = req.orgUser.orgId;
    const userId = req.user.userId;

    const VALID_STATUSES = [
      "Applied",
      "Screening",
      "Shortlisted",
      "Interview_Scheduled",
      "Interview_Completed",
      "Offered",
      "Hired",
      "Rejected"
    ];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    /** 1️⃣ Fetch candidate once */
    const candidate = await Candidate.findOne({
      _id: candidateId,
      organization: organizationId
    }).populate("interviews offer");

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    if (candidate.status === status) {
      return res.status(400).json({
        success: false,
        message: `Candidate already in ${status}`
      });
    }

    /** 2️⃣ Prevent backward movement */
    if (
      VALID_STATUSES.indexOf(status) <
      VALID_STATUSES.indexOf(candidate.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Backward status movement not allowed"
      });
    }

    /** 3️⃣ STATUS-SPECIFIC VALIDATION */
    switch (status) {
   

      case "Offered": {
        const hasInterview = candidate.interviews?.length > 0;
        if (!hasInterview) {
          return res.status(400).json({
            success: false,
            message: "Cannot offer without interview"
          });
        }
        break;
      }

      case "Hired": {
        if (!offerId) {
          return res.status(400).json({
            success: false,
            message: "offerId is required to hire"
          });
        }

        const offer = await Offer.findOne({
          _id: offerId,
          Organization: organizationId
        });

        if (!offer) {
          return res.status(404).json({ message: "Offer not found" });
        }

        if (!candidate.employeeProfile) {
          const employeeId = generateEmployeeId();

          const employeeProfile = await EmployeeProfile.create({
            organizationId,
            employeeId,
            offer: offer._id,
            personalInfo: {
              firstName: candidate.firstName,
              lastName: candidate.lastName,
              email: candidate.email,
              phone: candidate.phoneNumber
            },
            jobInfo: {
              position: offer.position
            },
            createdBy: userId
          });

          candidate.employeeProfile = employeeProfile._id;
        }

        offer.status = "Accepted";
        await offer.save();
        break;
      }
    }

    /** 4️⃣ Update status + stage history */
    candidate.status = status;
    candidate.lastUpdated = new Date();
    candidate.stageHistory.push({
      stage: status,
      changedAt: new Date(),
      changedBy: userId
    });

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: `Candidate moved to ${status}`,
      candidate
    });

  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getCandidatesList = async (req, res) => {
  try {
    const { orgId } = req.orgUser;

    // Fetch only candidates belonging to this organization
    const candidates = await Candidate.find(
      { organization: orgId },
      { _id: 1, email: 1 } // only these two fields
    ).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Candidates list fetched successfully",
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    logger.error("Error fetching candidates list:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching candidates list",
      error: err.message,
    });
  }
};
const sendEmployeeWelcomeEmail = async ({
  candidate,
  employee,
  offer,
  tempPassword
}) => {
  await sendEmail({
    to: candidate.email,
    subject: "Welcome to the Company – Your Joining Details",
    html: `
      <p>Dear ${candidate.firstName} ${candidate.lastName},</p>

      <p>Congratulations! We are pleased to welcome you to 
      <strong>Our Company</strong>.</p>

      <h3>📌 Employment Details</h3>
      <ul>
        <li><strong>Job Title:</strong> ${offer.offerDetails.jobTitle}</li>
        <li><strong>Department:</strong> ${offer.offerDetails.location}</li>
        <li><strong>Joining Date:</strong> ${new Date(employee.joinDate).toDateString()}</li>
        <li><strong>Work Location:</strong> ${employee.workLocation}</li>
      </ul>

      <h3>💰 Compensation</h3>
      <ul>
        <li><strong>CTC:</strong> ${offer.offerDetails.currency}
        ${offer.offerDetails.baseSalary.toLocaleString()}</li>
        <li><strong>Bonus:</strong> ${offer.offerDetails.currency}
        ${offer.offerDetails.bonus.toLocaleString()}</li>
        <li><strong>Pay Frequency:</strong> ${offer.offerDetails.payFrequency}</li>
      </ul>

      <h3>🔐 Login Credentials</h3>
      <p>
        <strong>Employee Code:</strong> ${employee.employeeCode}<br/>
        <strong>Temporary Password:</strong> ${tempPassword}
      </p>

      <p>
        Please log in on your first day and complete your onboarding
        (documents, bank details, and KYC).
      </p>

      <p>
        If you have any questions, feel free to contact the HR team.
      </p>

      <p>
        Warm regards,<br/>
        <strong>HR Team</strong>
      </p>
    `
  });
};