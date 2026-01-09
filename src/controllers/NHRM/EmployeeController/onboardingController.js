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
// export const updateOnboardingStatus = async (req, res) => {
//   try {
//     const { onboardingId } = req.params;
//     const reviewedBy = req.user.userId;
//     const organizationId = req.orgUser.orgId;
//     const { status, rejectionReason } = req.body;

//     if (!status) {
//       return res.status(400).json({ message: "Status is required" });
//     }

//     const onboarding = await Onboarding.findOne({
//       _id: onboardingId,
//       organizationId,
//     });

//     if (!onboarding) {
//       return res.status(404).json({ message: "Onboarding not found" });
//     }

//     // Prevent updating to same status
//     if (onboarding.status === status) {
//       return res.status(400).json({ message: `Onboarding is already in  '${status} '` });
//     }

//     // If rejected, reason is mandatory
//     if (status === "Rejected" && !rejectionReason) {
//       return res.status(400).json({
//         message: "Rejection reason is required when rejecting onboarding",
//       });
//     }

//     // Fetch employee profile from onboarding doc
//     const employeeProfile = await EmployeeProfile.findOne({
//       _id: onboarding.employeeId,
//       organizationId,
//     });

//     if (!employeeProfile) {
//       return res.status(404).json({ message: "Employee profile not found" });
//     }

//     // Update onboarding status
//     onboarding.status = status;
//     onboarding.reviewedBy = reviewedBy;
//     await onboarding.save();

//     // if (status == "Completed") {
//     // user can be either created or we will create the user profile and send credentails to users or we could send that login now
//     //   // menas onboadring is completed and user can be added to organization correct so lets do that 
//     //   await OrgMember.create({
//     //     userId: you, // well add this thing,
//     //     employeeId: employeeProfile.employeeId,
//     //     organizationId,
//     //     role://need to set somehow default permisson to him
//     // })
//     // }
//     // Sync employee profile status (keep it consistent)
//     employeeProfile.onboardingStatus = status;
//     await employeeProfile.save();
//     return res.status(200).json({
//       message: `Status updated to '${status}'`,
//       onboarding,
//     });

//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const updateOnboardingStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { onboardingId } = req.params;
    const organizationId = req.orgUser.orgId;
    const reviewedBy = req.user.userId;

    const {
      status,
      rejectionReason,
      shiftId,
      attendanceStartDate
    } = req.body;

    /* ===============================
       BASIC VALIDATION
    =============================== */
    if (!status) {
      throw new Error("status is required");
    }

    const onboarding = await Onboarding.findOne(
      { _id: onboardingId, organizationId },
      null,
      { session }
    );

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    if (onboarding.status === status) {
      throw new Error(`Onboarding already in '${status}' state`);
    }

    const employee = await EmployeeProfile.findOne(
      { _id: onboarding.employeeId, organizationId },
      null,
      { session }
    );

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    /* ===============================
       REJECTION FLOW
    =============================== */
    if (status === "Rejected") {
      if (!rejectionReason) {
        throw new Error("rejectionReason is mandatory when rejecting onboarding");
      }

      onboarding.status = "Rejected";
      onboarding.rejectionReason = rejectionReason;
      onboarding.reviewedBy = reviewedBy;
      await onboarding.save({ session });

      employee.onboardingStatus = "Rejected";
      await employee.save({ session });

      await session.commitTransaction();
      return res.json({ success: true, message: "Onboarding rejected" });
    }

    /* ===============================
       COMPLETION FLOW (CRITICAL)
    =============================== */
    if (status === "Completed") {
      /* 🔒 Required fields */
      if (!shiftId) throw new Error("shiftId is required");
      if (!attendanceStartDate) throw new Error("attendanceStartDate is required");

      const startDate = new Date(attendanceStartDate);

      if (employee.jobInfo?.joinDate && startDate < employee.jobInfo.joinDate) {
        throw new Error("attendanceStartDate cannot be before joinDate");
      }

      /* 1️⃣ Attendance Policy */
      const policy = await AttendancePolicy.findOne(
        { organizationId, isActive: true },
        null,
        { session }
      );
      if (!policy) throw new Error("AttendancePolicy not configured");

      /* 2️⃣ Shift validation */
      const shift = await ShiftMaster.findOne(
        { _id: shiftId, organizationId, isActive: true },
        null,
        { session }
      );
      if (!shift) throw new Error("Invalid or inactive shift");

      /* 3️⃣ Paid Leave Types */
      const paidLeaveTypes = await LeaveType.find(
        { organizationId, isActive: true, isPaid: true },
        null,
        { session }
      );
      if (paidLeaveTypes.length === 0) {
        throw new Error("No paid leave types configured");
      }

      /* ===============================
         EMPLOYEE ACTIVATION
      =============================== */
      employee.onboardingStatus = "Completed";
      employee.attendanceEnabled = true;
      employee.attendanceStartDate = startDate;
      employee.activatedAt = new Date();
      await employee.save({ session });

      /* ===============================
         SHIFT ASSIGNMENT (SAFE)
      =============================== */
      await EmployeeShiftAssignment.updateMany(
        {
          organizationId,
          employeeId: employee._id,
          isActive: true,
          effectiveTo: null
        },
        {
          isActive: false,
          effectiveTo: new Date(startDate.getTime() - 1)
        },
        { session }
      );

      await EmployeeShiftAssignment.create(
        [{
          organizationId,
          employeeId: employee._id,
          shiftId,
          effectiveFrom: startDate,
          isActive: true
        }],
        { session }
      );

      /* ===============================
         LEAVE BALANCE INITIALIZATION
      =============================== */
      const year = startDate.getFullYear();

      for (const leaveType of paidLeaveTypes) {
        await LeaveBalance.findOneAndUpdate(
          {
            organizationId,
            employeeId: employee._id,
            leaveTypeId: leaveType._id,
            year
          },
          {
            organizationId,
            employeeId: employee._id,
            leaveTypeId: leaveType._id,
            isPaid: true,
            year,
            totalAllocated: leaveType.annualAllocation,
            used: 0,
            remaining: leaveType.annualAllocation
          },
          { upsert: true, session }
        );
      }

      onboarding.status = "Completed";
      onboarding.reviewedBy = reviewedBy;
      onboarding.rejectionReason = null;
      await onboarding.save({ session });
    }

    await session.commitTransaction();
    return res.json({
      success: true,
      message: `Onboarding status updated to '${status}'`
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
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
