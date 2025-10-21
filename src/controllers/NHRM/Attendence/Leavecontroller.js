import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import Leave from "../../../models/NHRM/TimeAndAttendence/leaveManagement.js";

// 1. Create Leave Request
export const createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, daysRequested, partialDay, leaveHours, reason, supportingDocument } = req.body;

    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const leave = new Leave({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      daysRequested,
      partialDay,
      leaveHours,
      reason,
      supportingDocument,
      status: 'Pending',
    });

    await leave.save();
    res.status(201).json({ message: 'Leave request created', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Update Leave Request (approve/reject or update fields)
export const updateLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const updateData = req.body;

    const leave = await Leave.findByIdAndUpdate(leaveId, updateData, { new: true });
    if (!leave) return res.status(404).json({ error: 'Leave not found' });

    res.status(200).json({ message: 'Leave updated', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Get Leaves (by employee, department, date range, or status)
export const getLeaves = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const query = {};

    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    if (startDate && endDate) query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const leaves = await Leave.find(query)
      .populate('employee', 'personalInfo jobInfo')
      .sort({ startDate: -1 });

    res.status(200).json({ leaves });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
