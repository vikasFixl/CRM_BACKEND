import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { Offer } from "../../../models/NHRM/Recruitement/offerManagement.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js";
import { Interview } from "../../../models/NHRM/Recruitement/interviewScheduling.js";
import { candidateSchema, updateCandidateSchema } from "../../../validations/hrm/candidate.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import { generateEmployeeId, generateShortPassword } from "../../../utils/helperfuntions/generateInviteCode.js";
import { sendEmail } from "../../../../config/nodemailer.config.js";
import { Position } from "../../../models/NHRM/employeeManagement/postition.js";
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
//     console.error(err);
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
    console.error(error);
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
    const { jobId, status, page = 1, limit = 10 } = req.query; // default page=1, limit=10
    const { orgId } = req.orgUser;

    // 1️⃣ Build filter
    const filter = { organization: orgId };
    if (jobId) filter.jobApplication = jobId;
    if (status) filter.status = status;

    // 2️⃣ Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // 3️⃣ Fetch candidates with pagination
    const candidates = await Candidate.find(filter)
      .populate("jobApplication")
      .populate("interviews")
      .populate("offer")
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    // 4️⃣ Total count for pagination
    const totalCandidates = await Candidate.countDocuments(filter);
    const totalPages = Math.ceil(totalCandidates / limitNumber);

    // 5️⃣ Response
    res.json({
      success: true,
      message: "Candidates fetched successfully with pagination",
      page: pageNumber,
      limit: limitNumber,
      totalCandidates,
      totalPages,
      candidates,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
export const MovetoInterview = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { orgId } = req.orgUser;
    const { interviewerId, scheduledDate, interviewType, panel } = req.body;
    let candidate = await Candidate.findOne({ _id: candidateId, organization: orgId });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    const interview = new Interview({
      candidate: candidateId,
      jobPosting: candidate.jobApplication,
      interviewer: interviewerId,       // from HR input
      scheduledDate,
      interviewType,
      panel,
      status: "Scheduled",
    });
    await interview.save();

    await candidate.updateOne({ $push: { interviews: interview._id }, status: "Interview_Scheduled", lastUpdated: new Date() });


    res.json({ message: "candidate moved to interview stage" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Move Candidate to Offer
export const moveToOffer = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { orgId: organization } = req.orgUser;
    const { offerData, jobApplicationId, positionId } = req.body; // Expect salary, bonus, benefits, jobTitle, location, payFrequency, etc.
    if (!offerData || !offerData.baseSalary) {
      return res.status(400).json({ message: "Incomplete offer data" });
    }
    if (!jobApplicationId || !positionId) {
      return res.status(400).json({ message: "Job Application ID and Position ID are required" });
    }
    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    let candidate = await Candidate.findOne({ _id: candidateId, organization });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });


    const jobApplication = await JobPosting.findById(jobApplicationId);
    if (!jobApplication) return res.status(404).json({ message: "Job Application not found" });
    const position = await Position.findById(positionId);
    if (!position) return res.status(404).json({ message: "Position not found" });

    // Create Offer for the candidate
    const offer = await Offer.create({
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
        location: offerData.location,
      },
    });

    candidate.status = "Offered";
    candidate.offer = offer._id;
    candidate.lastUpdated = new Date();
    // Send professional email to candidate with offer details
    await sendEmail({
      to: candidate.email,
      subject: "Your Offer Letter from Our Company",
      html: `
        <p>Hi ${candidate.firstName} ${candidate.lastName},</p>
        <p>Congratulations! We are excited to offer you the position of <strong>${offer.offerDetails.jobTitle}</strong> at <strong>${offer.offerDetails.location}</strong>.</p>
        <p><strong>Offer Details:</strong></p>
        <ul>
          <li>Base Salary: ${offer.offerDetails.currency} ${offer.offerDetails.baseSalary.toLocaleString()}</li>
          <li>Bonus: ${offer.offerDetails.currency} ${offer.offerDetails.bonus.toLocaleString()}</li>
          <li>Pay Frequency: ${offer.offerDetails.payFrequency}</li>
          <li>Benefits: ${offer.offerDetails.benefits.join(", ") || "N/A"}</li>
        </ul>
        <p>Please review the offer and respond at your earliest convenience. We look forward to welcoming you to the team!</p>
        <p>Best regards,<br/>HR Team</p>
      `,
    });

    res.json({ message: "Candidate moved to offer stage and email sent", candidate, offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const moveToHired = async (req, res) => {
  try {
    const { candidateId, offerId } = req.body;
    const hrId = req.user.userId;
    const { orgId: organization } = req.orgUser;

    // 1️⃣ Fetch candidate
    const candidate = await Candidate.find({ _id: candidateId, organization });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    if (candidate.status === "Hired") return res.status(400).json({ message: "Candidate is already hired" });






    const offer = await Offer.findById(offerId).populate("position").populate("department")
    if (!offer) return res.status(404).json({ message: "Offer not found " });
    // generate employe id
    const employeeId = generateEmployeeId();
    const password = await generateShortPassword();
    // 3️⃣ Create EmployeeProfile
    const employeeProfile = new EmployeeProfile({
      organizationId: req.orgUser?.orgId,
      employeeId,
      password,
      personalInfo: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        contact: {
          email: candidate.email,
          phone: candidate.phoneNumber,
          location: candidate.location,
        }
      },
      jobInfo: {
        position: offer.position,
      }
      ,
      createdBy: hrId,
    });
    const savedEmployee = await employeeProfile.save();

    // 4️⃣ Update candidate
    candidate.status = "Hired";
    candidate.offer = offer._id;
    candidate.employeeProfile = savedEmployee._id;
    candidate.lastUpdated = new Date();
    candidate.stageHistory.push({
      stage: "Hired",
      changedAt: new Date(),
      changedBy: hrId,
    });
    await candidate.save();

    // 5️⃣ Send onboarding email
    await sendEmail({
      to: candidate.email,
      subject: "Welcome to the Company!",
      html: `<p>Hi ${candidate.firstName},</p>
             <p>Congratulations! You have been hired as ${offer.position}.</p>
             <p>Your joining date is ${new Date(offer.startDate).toDateString()}.</p>
             <p>We look forward to having you on the team!</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Candidate moved to Hired stage, EmployeeProfile created, onboarding email sent",
      candidate,
      employeeProfile: savedEmployee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// controllers/candidateController.js

export const updateCandidateStatus = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status } = req.body;
    const orgId = req.orgUser.orgId;

    // Validate status

    const validStatuses = ["Applied",
      "Screening",
      "Shortlisted",
      "Interview_Scheduled",
      "Interview_Completed",
      "Offered",
      "Rejected",
      "Hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }



    let candidate = await Candidate.findOne({ _id: candidateId, organization: orgId });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }
    // Optional: enforce allowed transitions
    const currentIndex = validStatuses.indexOf(candidate.status);
    const newIndex = validStatuses.indexOf(status);

    if (newIndex < currentIndex) {
      return res.status(400).json({
        success: false,
        message: `Cannot move backward from ${candidate.status} to ${status}.`
      });
    }
    // Helper function to check if interview stage exists
    ;
    if (candidate.status === status) {
      return res.status(400).json({
        success: false,
        message: `Candidate is already in ${status} status.`,
      });
    }


    if (candidate.status != status) {
      // create stage history entry
      const stageEntry = {
        stage: status,
        changedAt: new Date(),
        changedBy: req.user.userId,
      };
      candidate.stageHistory.push(stageEntry);
    }

    // Handle side effects for certain statuses
    switch (status) {
      case "Interview_Scheduled":
        {
          const { interviewerId, scheduledDate, interviewType, panel } = req.body;

          // Make sure required fields are provided
          if (!interviewerId || !scheduledDate || !interviewType || !panel) {
            return res.status(400).json({
              success: false,
              message: "interviewerId, scheduledDate, interviewType, and panel are required for scheduling an interview",
            });
          }

          // Create new interview
          const interview = new Interview({
            candidate: candidateId,
            jobPosting: candidate.jobApplication,
            interviewer: interviewerId,
            scheduledDate,
            interviewType,
            panel,
            status: "Scheduled",
          });

          await interview.save();
          // Update candidate
          await candidate.updateOne({
            $push: { interviews: interview._id },
            status: "Interview_Scheduled",
            lastUpdated: new Date(),
          });

          candidate = await Candidate.findById(candidateId).populate("interviews"); // optional: return populated data
        }
        return res.status(200).json({
          success: true,
          message: "Candidate moved to Interview Scheduled stage",
          candidate,
        });
        break;
      case "Offered":
        {
          const { offerData, jobApplicationId, positionId } = req.body;


          if (!offerData || !offerData.baseSalary) {
            return res.status(400).json({ message: "Incomplete offer data" });
          }
          if (!jobApplicationId || !positionId) {
            return res.status(400).json({ message: "Job Application ID and Position ID are required" });
          }

          // Fetch candidate
          let candidate = await Candidate.findOne({ _id: candidateId, organization: req.orgUser.orgId });
          if (!candidate) return res.status(404).json({ message: "Candidate not found" });

          // Ensure candidate has at least one interview stage
          const hasInterview = candidate.stageHistory.some(stage =>
            stage.stage === "Interview_Scheduled" || stage.stage === "Interview_Completed"
          );

          if (!hasInterview) {
            return res.status(400).json({
              message: `Cannot move candidate to ${status}. Candidate must have at least one interview stage in history.`,
            });
          }
          // Validate job posting and position
          const jobApplication = await JobPosting.findById(jobApplicationId);
          if (!jobApplication) return res.status(404).json({ message: "Job Application not found" });

          const position = await Position.findById(positionId);
          if (!position) return res.status(404).json({ message: "Position not found" });

          // Create Offer
          const offer = await Offer.create({
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
              location: offerData.location,
            },
          });

          // Update candidate status and link offer
          candidate.status = "Offered";
          candidate.offer = offer._id;
          candidate.lastUpdated = new Date();
          await candidate.save();



          // Return updated candidate and offer
          candidate = await Candidate.findById(candidateId).populate("offer");
        }
        return res.status(200).json({
          success: true,
          message: "Candidate moved to Offer stage",
          candidate,
        });
        break;
      case "Hired":
        {
          const { offerId } = req.body;
          const hrId = req.user.userId;
          const organization = req.orgUser.orgId;

          // 1️⃣ Fetch candidate
          let candidate = await Candidate.findOne({ _id: candidateId, organization });
          if (!candidate) return res.status(404).json({ message: "Candidate not found" });
          if (candidate.status === "Hired") return res.status(400).json({ message: "Candidate is already hired" });
          // Ensure candidate has at least one interview stage
          const hasInterview = candidate.stageHistory.some(stage =>
            stage.stage === "Interview_Scheduled" || stage.stage === "Interview_Completed"
          );

          if (!hasInterview) {
            return res.status(400).json({
              message: `Cannot move candidate to ${status}. Candidate must have at least one interview stage in history.`,
            });
          }

          // 2️⃣ Fetch offer
          const offer = await Offer.findById(offerId).populate("position");
          if (!offer) return res.status(404).json({ message: "Offer not found" });

          // 3️⃣ Generate employee ID & password
          const employeeId = generateEmployeeId();
          const password = await generateShortPassword();

          // 4️⃣ Create EmployeeProfile
          const employeeProfile = new EmployeeProfile({
            organizationId: organization,
            employeeId,
            password,
            offer: offer._id,
            personalInfo: {
              firstName: candidate.firstName,
              lastName: candidate.lastName,
              contact: {
                email: candidate.email,
                phone: candidate.phoneNumber,
                location: candidate.location,
              },
            },
            jobInfo: {
              position: offer.position._id,
              department: offer.position.department,
            },
            createdBy: hrId,
          });

          const savedEmployee = await employeeProfile.save();

          // 5️⃣ Update candidate
          candidate.status = "Hired";
          candidate.offer = offer._id;
          offer.status = "Accepted";
          await offer.save();
          candidate.employeeProfile = savedEmployee._id;
          candidate.lastUpdated = new Date();
          candidate.stageHistory.push({
            stage: "Hired",
            changedAt: new Date(),
            changedBy: hrId,
          });
          await candidate.save();


          candidate = await Candidate.findById(candidateId).populate("offer");
        }
        return res.status(200).json({
          success: true,
          message: "Candidate moved to Hired stage, EmployeeProfile created",
          candidate,
        });
        break;
      case "Rejected":
        {
          const hrId = req.user.userId;
          const organization = req.orgUser.orgId;

          // 1️⃣ Fetch candidate
          const candidate = await Candidate.findOne({ _id: candidateId, organization });
          if (!candidate) return res.status(404).json({ message: "Candidate not found" });
           // Ensure candidate has at least one interview stage
          const hasInterview = candidate.stageHistory.some(stage =>
            stage.stage === "Interview_Scheduled" || stage.stage === "Interview_Completed"
          );

          if (!hasInterview) {
            return res.status(400).json({
              message: `Cannot move candidate to ${status}. Candidate must have at least one interview stage in history.`,
            });
          }

          // 2️⃣ Update candidate status
          candidate.status = "Rejected";
          candidate.lastUpdated = new Date();
          candidate.stageHistory.push({
            stage: "Rejected",
            changedAt: new Date(),
            changedBy: hrId,
          });
          await candidate.save();

          // 3️⃣ Optional: Delete or mark offer as rejected
          if (candidate.offer) {
            await Offer.findByIdAndUpdate(candidate.offer, { status: "Rejected" });
          }
          candidate.interviews = []
          await candidate.save();

          // 4️⃣ Optional: Cancel interviews
          await Interview.updateMany(
            { candidate: candidateId },
            { status: "Canceled" }
          );

        }
        return res.status(200).json({
          success: true,
          message: "Candidate marked as Rejected, related interviews canceled",
          candidate,
        });
        break;

    }
    candidate.status = status;
    await candidate.save();



    res.status(200).json({
      success: true,
      message: `Candidate status updated to ${status}.`,
      candidate,
    });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
