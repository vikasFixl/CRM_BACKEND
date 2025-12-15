import AttendancePolicy from "../models/AttendancePolicy.js";

/**
 * CREATE / UPDATE POLICY
 * (Deactivates previous policy automatically)
 */
export const upsertPolicy = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Deactivate old policy
    await AttendancePolicy.updateMany(
      { organizationId, isActive: true },
      { isActive: false }
    );

    const policy = await AttendancePolicy.create({
      organizationId,
      ...req.body,
      isActive: true
    });

    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ACTIVE POLICY
 */
export const getActivePolicy = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const policy = await AttendancePolicy.findOne({
      organizationId,
      isActive: true
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Attendance policy not configured"
      });
    }

    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
