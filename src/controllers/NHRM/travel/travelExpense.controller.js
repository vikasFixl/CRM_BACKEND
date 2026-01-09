import { TravelExpense } from "../../../models/NHRM/Travel Management/TravelExpense.js";
import { TravelPolicy } from "../../../models/NHRM/Travel Management/TravelPolicy.js";
import { TravelRequest } from "../../../models/NHRM/Travel Management/TravelRequest.js";

// Create travel expense
export const createTravelExpense = async (req, res) => {
  try {
    const { travelRequest, category, amount, expenseDate, description, receiptUrl } = req.body;

    if (!travelRequest || !category || !amount || !expenseDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure travel request exists and is approved
    const request = await TravelRequest.findById(travelRequest);
    if (!request || request.status !== 'Approved') {
      return res.status(400).json({ error: 'Travel request not found or not approved' });
    }

    // Get applicable policy for validation
    const policy = await TravelPolicy.findById(request.travelPolicy);

    if (policy && policy.maxPerCategory[category] && amount > policy.maxPerCategory[category]) {
      return res.status(400).json({ error: `Amount exceeds policy limit for ${category}` });
    }

    const expense = await TravelExpense.create({
      travelRequest,
      employee: req.user._id,
      category,
      amount,
      expenseDate,
      receiptUrl,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error creating travel expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get expenses (filter by employee, category, date)
export const getTravelExpenses = async (req, res) => {
  try {
    const { employeeId, category, startDate, endDate, status } = req.query;
    const query = {};

    if (employeeId) query.employee = employeeId;
    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate && endDate) {
      query.expenseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const expenses = await TravelExpense.find(query)
      .populate('employee travelRequest approver', 'name destination purpose')
      .sort({ expenseDate: 1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    logger.error('Error fetching travel expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or reject expense
export const updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const expense = await TravelExpense.findById(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    expense.status = action;
    expense.approver = req.user._id;
    expense.approvedDate = new Date();
    expense.description = comment || expense.description;

    await expense.save();

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error updating expense status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
