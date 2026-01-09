import HolidayCalendar from "../../../models/NHRM/TimeAndAttendence/HolidayCalendar.js";

export const createHoliday = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;

    const holiday = await HolidayCalendar.create({
      organizationId,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: holiday,
      message: "Holiday created successfully"
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Holiday already exists for this date"
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};
export const getHolidays = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { year } = req.query;
    logger.info(year);
    logger.info(organizationId);

    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    const holidays = await HolidayCalendar.find({
      organizationId,
      isActive: true,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: holidays
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getEmployeeHolidays = async (req, res) => {
  try {
    const { organizationId, locationId } = req.user;
    const { from, to } = req.query;

    const holidays = await HolidayCalendar.find({
      organizationId,
      isActive: true,
      date: { $gte: new Date(from), $lte: new Date(to) },
      $or: [
        { locationId: null },
        { locationId }
      ]
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: holidays
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const updateHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const organizationId = req.orgUser.orgId;

    const allowedFields = ["name", "type", "isPaid", "isActive", "locationId"];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await HolidayCalendar.findOneAndUpdate(
      { _id: holidayId, organizationId },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found"
      });
    }

    res.json({
      success: true,
      data: updated,
      message: "Holiday updated successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const disableHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const organizationId = req.orgUser.orgId;

    const holiday = await HolidayCalendar.findOneAndUpdate(
      { _id: holidayId, organizationId },
      { isActive: false },
      { new: true }
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found"
      });
    }

    res.json({
      success: true,
      message: "Holiday disabled successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
