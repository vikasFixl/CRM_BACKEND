import Attendance from "../../../models/NHRM/TimeAndAttendence/attendanceManagement.js";
import EmployeeProfile from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import TimeTracking from "../../../models/NHRM/TimeAndAttendence/timeTracking.js";
/**
 * Create Attendance (Manual Entry)
 */
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, date, shiftType, status, absentReason, notes } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ error: 'employeeId, date, and status are required.' });
    }

    // Check if attendance already exists for the employee on this date
    const existing = await Attendance.findOne({ employee: employeeId, date: new Date(date) });
    if (existing) {
      return res.status(400).json({ error: 'Attendance already exists for this employee on this date.' });
    }

    const attendance = new Attendance({
      employee: employeeId,
      date,
      shiftType,
      status,
      absentReason,
      notes,
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance created successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update Attendance
 */
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { shiftType, status, absentReason, notes } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    if (shiftType) attendance.shiftType = shiftType;
    if (status) attendance.status = status;
    if (absentReason) attendance.absentReason = absentReason;
    if (notes) attendance.notes = notes;

    await attendance.save();
    res.json({ message: 'Attendance updated successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get Attendance
 * Filters: employeeId, startDate, endDate, departmentId, organizationId
 */
export const getAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, departmentId, organizationId } = req.query;

    const query = {};

    if (employeeId) query.employee = employeeId;

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by department or organization
    if (departmentId || organizationId) {
      const empFilter = { _id: employeeId };
      if (departmentId) empFilter.department = departmentId;
      if (organizationId) empFilter.organizationId = organizationId;

      const employees = await EmployeeProfile.find(empFilter).select('_id');
      query.employee = { $in: employees.map(e => e._id) };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'personalInfo jobInfo department')
      .sort({ date: -1 });

    res.json({ attendance: attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, shiftType, notes } = req.body;

    // 1️⃣ Create Attendance
    const attendance = await Attendance.create({ employee: employeeId, date, status, shiftType, notes });

    // 2️⃣ Auto-create TimeTracking
    let clockInTime, clockOutTime;
    switch(shiftType) {
      case 'Morning':
        clockInTime = new Date(`${date}T09:00:00`);
        clockOutTime = new Date(`${date}T17:00:00`);
        break;
      case 'Evening':
        clockInTime = new Date(`${date}T13:00:00`);
        clockOutTime = new Date(`${date}T21:00:00`);
        break;
      case 'Night':
        clockInTime = new Date(`${date}T21:00:00`);
        clockOutTime = new Date(`${date}T05:00:00`);
        break;
      default: // Flexible
        clockInTime = new Date(date);
        clockOutTime = new Date(date);
    }

    const isLate = status === 'Late';

    const timeTracking = await TimeTracking.create({
      employee: employeeId,
      date,
      clockIn: clockInTime,
      clockOut: clockOutTime,
      status: 'Clock In',
      isLate,
      duration: (clockOutTime - clockInTime) / (1000 * 60 * 60) // hours
    });

    res.status(201).json({ attendance, timeTracking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

