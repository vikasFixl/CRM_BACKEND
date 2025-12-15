import ShiftMaster from "../../../models/NHRM/TimeAndAttendence/ShiftMaster.js";

/**
 * CREATE SHIFT
 */
export const createShift = async (req, res) => {
  try {
    const {
      shiftType,
      startTime,
      endTime,
      breakMinutes,
      graceInMinutes,
      graceOutMinutes,
      halfDayAfterMinutes,
      overtimeAfterMinutes,
      isNightShift
    } = req.body;

   const organizationId=req.orgUser.orgId;

    const shift = await ShiftMaster.create({
      organizationId,
      shiftType,
      startTime,
      endTime,
      breakMinutes,
      graceInMinutes,
      graceOutMinutes,
      halfDayAfterMinutes,
      overtimeAfterMinutes,
      isNightShift
    });

    res.status(201).json({ success: true, data: shift });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Shift type already exists for this organization"
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ACTIVE SHIFTS
 */
export const getActiveShifts = async (req, res) => {
  try {
   const organizationId=req.orgUser.orgId;

    const shifts = await ShiftMaster.find({
      organizationId,
      isActive: true
    }).sort({ shiftType: 1 });

    res.json({ success: true, data: shifts ,message:"Shifts fetched successfully."});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE SHIFT
 */
export const updateShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
  const organizationId=req.orgUser.orgId;

    const updated = await ShiftMaster.findOneAndUpdate(
      { _id: shiftId, organizationId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DISABLE SHIFT (NO DELETE)
 */
export const disableShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
  const organizationId=req.orgUser.orgId;

    const shift = await ShiftMaster.findOneAndUpdate(
      { _id: shiftId, organizationId },
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    res.json({ success: true, message: "Shift disabled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
