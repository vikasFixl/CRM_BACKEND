import EmployeeShiftAssignment from "../../../models/NHRM/TimeAndAttendence/EmployeeShiftAssignment.js";
import ShiftMaster from "../../../models/NHRM/TimeAndAttendence/ShiftMaster.js";

/**
 * ASSIGN OR CHANGE SHIFT FOR EMPLOYEE
 * HR / ADMIN only
 */
export const assignShift = async (req, res) => {
  try {
  const organizationId=req.orgUser.orgId;
    const { employeeId, shiftId, effectiveFrom, locationId } = req.body;

    if (!employeeId || !shiftId) {
      return res.status(400).json({
        success: false,
        message: "employeeId and shiftId are required"
      });
    }

    const startDate = effectiveFrom ? new Date(effectiveFrom) : new Date();

    // 1️⃣ Validate shift exists and is active
    const shift = await ShiftMaster.findOne({
      _id: shiftId,
      organizationId,
      isActive: true
    });

    if (!shift) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive shift"
      });
    }

    // 2️⃣ Close current active assignment (if any)
    await EmployeeShiftAssignment.findOneAndUpdate(
      {
        organizationId,
        employeeId,
        isActive: true,
        effectiveTo: null
      },
      {
        isActive: false,
        effectiveTo: new Date(startDate.getTime() - 1)
      }
    );

    // 3️⃣ Create new assignment
    const assignment = await EmployeeShiftAssignment.create({
      organizationId,
      employeeId,
      shiftId,
      effectiveFrom: startDate,
      effectiveTo: null,
      isActive: true,
      locationId
    });

    return res.status(201).json({
      success: true,
      message: "Shift assigned successfully",
      data: assignment
    });

  } catch (err) {
    // Duplicate active shift protection (partial unique index)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Employee already has an active shift assigned"
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * GET CURRENT ACTIVE SHIFT FOR AN EMPLOYEE
 */
export const getCurrentShift = async (req, res) => {
  try {
  const organizationId=req.orgUser.orgId;
    const { employeeId } = req.params;

    const assignment = await EmployeeShiftAssignment.findOne({
      organizationId,
      employeeId,
      isActive: true,
      effectiveTo: null
    }).populate("shiftId");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No active shift found for employee"
      });
    }

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DISABLE SHIFT ASSIGNMENT (e.g. employee exit, suspension)
 * DOES NOT DELETE HISTORY
 */
export const disableShiftAssignment = async (req, res) => {
  try {
  const organizationId=req.orgUser.orgId;
    const { assignmentId } = req.params;

    const assignment = await EmployeeShiftAssignment.findOneAndUpdate(
      { _id: assignmentId, organizationId, isActive: true },
      {
        isActive: false,
        effectiveTo: new Date()
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Active shift assignment not found"
      });
    }

    res.json({
      success: true,
      message: "Shift assignment disabled",
      data: assignment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET SHIFT HISTORY FOR EMPLOYEE
 */
export const getShiftHistory = async (req, res) => {
  try {
  const organizationId=req.orgUser.orgId;
    const { employeeId } = req.params;

    const history = await EmployeeShiftAssignment.find({
      organizationId,
      employeeId
    })
      .populate("shiftId")
      .sort({ effectiveFrom: -1 });

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
