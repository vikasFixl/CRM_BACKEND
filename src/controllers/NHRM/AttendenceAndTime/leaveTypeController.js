import LeaveType from "../../../models/NHRM/TimeAndAttendence/LeaveType.js";

/**
 * CREATE LEAVE TYPE (HR/Admin)
 */
export const createLeaveType = async (req, res) => {
  try {
  const organizationId=req.orgUser.orgId;

    const leaveType = await LeaveType.create({
      organizationId,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: leaveType
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Leave code already exists for this organization"
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * GET ACTIVE LEAVE TYPES
 */
export const getActiveLeaveTypes = async (req, res) => {
  try {
  const organizationId=req.orgUser.orgId;

    const leaveTypes = await LeaveType.find({
      organizationId,
      isActive: true
    }).sort({ name: 1 });

    res.json({ success: true, data: leaveTypes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE LEAVE TYPE (SAFE FIELDS ONLY)
 */
export const updateLeaveType = async (req, res) => {
  try {
    const { leaveTypeId } = req.params;
  const organizationId=req.orgUser.orgId;

    // Prevent isPaid update
    delete req.body.isPaid;
    delete req.body.organizationId;

    const updated = await LeaveType.findOneAndUpdate(
      { _id: leaveTypeId, organizationId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found"
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DISABLE LEAVE TYPE (NO DELETE)
 */
export const disableLeaveType = async (req, res) => {
  try {
    const { leaveTypeId } = req.params;
  const organizationId=req.orgUser.orgId;

    const disabled = await LeaveType.findOneAndUpdate(
      { _id: leaveTypeId, organizationId },
      { isActive: false },
      { new: true }
    );

    if (!disabled) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found"
      });
    }

    res.json({
      success: true,
      message: "Leave type disabled"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
