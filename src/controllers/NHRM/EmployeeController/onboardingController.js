import { Onboarding } from "../../../models/NHRM/employeeManagement/onboarding.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import { OrgMember } from "../../../models/OrganisationMemberSchema.js"
export const initiateOnboarding = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const organizationId = req.orgUser.orgId;
    const initiatedBy = req.user.userId;


    if (!employeeId) {
      return res.status(400).json({ message: " employeeId is required" });
    }
    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    // Check existing onboarding
    const existing = await Onboarding.findOne({
      organizationId,
      employeeId,
      status: { $ne: "Completed" }
    });

    if (existing) return res.status(200).json({ message: "Onboarding already initiated" });
    const onboarding = await Onboarding.create({
      organizationId,
      employeeId,
      initiatedBy,
      status: "Initiated",
    });

    employee.onboardingStatus = "Initiated";
    await employee.save();
    res.status(201).json({ message: "Onboarding initiated", onboarding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getOnboardingByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const onboarding = await Onboarding.findOne({ employeeId })
      .populate("organizationId", "name")
      .populate("employeeId", "firstName lastName email");

    if (!onboarding)
      return res.status(404).json({ message: "Onboarding not found" });

    res.status(200).json(onboarding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE STATUS (Pending → InProgress → Completed → Rejected)
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const reviewedBy = req.user.userId;
    const organizationId = req.orgUser.orgId;
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const onboarding = await Onboarding.findOne({
      _id: onboardingId,
      organizationId,
    });

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    // Prevent updating to same status
    if (onboarding.status === status) {
      return res.status(400).json({ message: `Onboarding is already in  '${status} '` });
    }

    // If rejected, reason is mandatory
    if (status === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required when rejecting onboarding",
      });
    }

    // Fetch employee profile from onboarding doc
    const employeeProfile = await EmployeeProfile.findOne({
      _id: onboarding.employeeId,
      organizationId,
    });

    if (!employeeProfile) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    // Update onboarding status
    onboarding.status = status;
    onboarding.reviewedBy = reviewedBy;
    await onboarding.save();

    // if (status == "Completed") {
    // user can be either created or we will create the user profile and send credentails to users or we could send that login now
    //   // menas onboadring is completed and user can be added to organization correct so lets do that 
    //   await OrgMember.create({
    //     userId: you, // well add this thing,
    //     employeeId: employeeProfile.employeeId,
    //     organizationId,
    //     role://need to set somehow default permisson to him
    // })
    // }
    // Sync employee profile status (keep it consistent)
    employeeProfile.onboardingStatus = status;
    await employeeProfile.save();
    return res.status(200).json({
      message: `Status updated to '${status}'`,
      onboarding,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// ✅ DELETE ONBOARDING (ONLY IF COMPLETED)
export const deleteOnboarding = async (req, res) => {
  try {
    const { onboardingId } = req.params;

    const onboarding = await Onboarding.findById(onboardingId);

    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });

    if (onboarding.status !== "Completed") {
      return res.status(400).json({
        message: "Onboarding can only be deleted when status is COMPLETED",
      });
    }

    await onboarding.deleteOne();

    res.status(200).json({ message: "Onboarding deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getOnboardings = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { status, employeeId, page = 1, limit = 10 } = req.query;

    const filter = { organizationId };
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    const skip = (page - 1) * limit;

    const [onboardings, total] = await Promise.all([
      Onboarding.find(filter)
        .populate({
          path: "employeeId",
          select: "onboardingStatus employeeId personalInfo",
        })


        .populate("initiatedBy", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Onboarding.countDocuments(filter),
    ]);
    return res.status(200).json({
      message: "Onboarding records fetched successfully",
      success: true,
      onboardings: onboardings.map((item) => ({
        onboardingId: item._id,
        employee: {
          id: item.employeeId?._id,
          employeeId: item.employeeId?.employeeId,
          email: item.employeeId?.email,
        },
        status: item.status,
        bankDetailsVerified: item.bankDetailsVerified,
        initiatedBy: item.initiatedBy,
        createdAt: item.createdAt,
      })),
      pagination: {
        totalRecords: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
