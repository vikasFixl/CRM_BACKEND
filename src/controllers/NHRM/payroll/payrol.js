import SalaryConfiguration from '../../models/PayrollManagement/salaryConfiguration.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import mongoose from 'mongoose';

// middlewares/asyncHandler.js
export const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create new salary configuration for an employee.
 * - Validates duplicates and overlapping effective dates
 * - Automatically increments version
 */
export const createSalaryConfig = asyncHandler(async (req, res) => {
  const { employee, organizationId, salaryType, base, components, effectiveFrom } = req.body;

  if (!employee || !organizationId || !salaryType || !base || !effectiveFrom) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const overlap = await SalaryConfiguration.findOne({
    employee,
    effectiveFrom: { $lte: new Date(effectiveFrom) },
    effectiveTo: { $exists: false },
    status: 'Active'
  });

  if (overlap) {
    return res.status(409).json({ error: 'Active configuration already exists for this employee' });
  }

  const config = await SalaryConfiguration.create({
    ...req.body,
    createdBy: req.user?._id,
  });

  res.status(201).json({ message: 'Salary configuration created', config });
});

/**
 * Get all salary configurations (paginated, filterable)
 */
export const getSalaryConfigs = asyncHandler(async (req, res) => {
  const { employee, status, limit = 20, page = 1 } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;

  const configs = await SalaryConfiguration.find(query)
    .populate('employee', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ effectiveFrom: -1 });

  const count = await SalaryConfiguration.countDocuments(query);
  res.json({ total: count, page, configs });
});

/**
 * Update salary configuration (only future or inactive configs)
 */
export const updateSalaryConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await SalaryConfiguration.findById(id);
  if (!config) return res.status(404).json({ error: 'Configuration not found' });

  if (config.status === 'Active') {
    return res.status(400).json({ error: 'Cannot update active configuration' });
  }

  Object.assign(config, req.body, { updatedBy: req.user?._id });
  await config.save();

  res.json({ message: 'Configuration updated', config });
});

/**
 * Deactivate salary configuration
 */
export const deactivateSalaryConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await SalaryConfiguration.findById(id);
  if (!config) return res.status(404).json({ error: 'Configuration not found' });

  config.status = 'Inactive';
  config.updatedBy = req.user?._id;
  await config.save();

  res.json({ message: 'Configuration deactivated' });
});

import SalaryConfiguration from '../../models/PayrollManagement/salaryConfiguration.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Create new salary configuration for an employee.
 * - Validates duplicates and overlapping effective dates
 * - Automatically increments version
 */
export const createSalaryConfig = asyncHandler(async (req, res) => {
  const { employee, organizationId, salaryType, base, components, effectiveFrom } = req.body;

  if (!employee || !organizationId || !salaryType || !base || !effectiveFrom) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const overlap = await SalaryConfiguration.findOne({
    employee,
    effectiveFrom: { $lte: new Date(effectiveFrom) },
    effectiveTo: { $exists: false },
    status: 'Active'
  });

  if (overlap) {
    return res.status(409).json({ error: 'Active configuration already exists for this employee' });
  }

  const config = await SalaryConfiguration.create({
    ...req.body,
    createdBy: req.user?._id,
  });

  res.status(201).json({ message: 'Salary configuration created', config });
});

/**
 * Get all salary configurations (paginated, filterable)
 */
export const getSalaryConfigs = asyncHandler(async (req, res) => {
  const { employee, status, limit = 20, page = 1 } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;

  const configs = await SalaryConfiguration.find(query)
    .populate('employee', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ effectiveFrom: -1 });

  const count = await SalaryConfiguration.countDocuments(query);
  res.json({ total: count, page, configs });
});

/**
 * Update salary configuration (only future or inactive configs)
 */
export const updateSalaryConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await SalaryConfiguration.findById(id);
  if (!config) return res.status(404).json({ error: 'Configuration not found' });

  if (config.status === 'Active') {
    return res.status(400).json({ error: 'Cannot update active configuration' });
  }

  Object.assign(config, req.body, { updatedBy: req.user?._id });
  await config.save();

  res.json({ message: 'Configuration updated', config });
});

/**
 * Deactivate salary configuration
 */
export const deactivateSalaryConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await SalaryConfiguration.findById(id);
  if (!config) return res.status(404).json({ error: 'Configuration not found' });

  config.status = 'Inactive';
  config.updatedBy = req.user?._id;
  await config.save();

  res.json({ message: 'Configuration deactivated' });
});


import TaxCalculation from '../../models/PayrollManagement/taxCalculation.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

/**
 * Create or auto-calculate tax entry for an employee.
 * Normally triggered after payrollProcessing.
 */
export const createTaxCalculation = asyncHandler(async (req, res) => {
  const { employee, payrollPeriod, grossIncome, breakdown } = req.body;

  if (!employee || !payrollPeriod || !grossIncome) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = await TaxCalculation.findOne({ employee, payrollPeriod });
  if (existing) return res.status(409).json({ error: 'Tax calculation already exists' });

  const tax = await TaxCalculation.create({
    ...req.body,
    createdBy: req.user?._id,
  });

  res.status(201).json({ message: 'Tax calculation created', tax });
});

/**
 * Get tax history for employee or period.
 */
export const getTaxCalculations = asyncHandler(async (req, res) => {
  const { employee, startDate, endDate } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (startDate && endDate)
    query.payrollPeriod = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const taxes = await TaxCalculation.find(query)
    .populate('employee', 'firstName lastName email')
    .sort({ payrollPeriod: -1 });

  res.json({ taxes });
});

/**
 * Recalculate tax totals (triggered after config change)
 */
export const recalculateTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tax = await TaxCalculation.findById(id);
  if (!tax) return res.status(404).json({ error: 'Not found' });

  const total = tax.breakdown.reduce((sum, t) => sum + parseFloat(t.amount?.toString() || '0'), 0);
  tax.totalTaxes = total;
  tax.netIncome = parseFloat(tax.grossIncome?.toString() || '0') - total;
  tax.updatedAt = new Date();

  await tax.save();
  res.json({ message: 'Tax recalculated', tax });
});

import PayrollProcessing from '../../models/PayrollManagement/payrollProcessing.js';
import SalaryConfiguration from '../../models/PayrollManagement/salaryConfiguration.js';
import TaxCalculation from '../../models/PayrollManagement/taxCalculation.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

/**
 * Generate payroll entry (with transaction)
 */
export const generatePayroll = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employee, payrollPeriod } = req.body;
    const salaryConfig = await SalaryConfiguration.findOne({ employee, status: 'Active' });
    if (!salaryConfig) throw new Error('No active salary config found');

    const grossPay = parseFloat(salaryConfig.base?.toString() || '0');
    const deductions = 0;
    const netPay = grossPay - deductions;

    const payroll = await PayrollProcessing.create([{
      employee,
      payrollPeriod,
      grossPay,
      totalDeductions: deductions,
      netPay,
      salaryConfiguration: salaryConfig._id,
      createdBy: req.user?._id,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Payroll generated', payroll: payroll[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * Approve payroll (Manager/HR only)
 */
export const approvePayroll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payroll = await PayrollProcessing.findById(id);
  if (!payroll) return res.status(404).json({ error: 'Not found' });

  payroll.status = 'Approved';
  payroll.approvedBy = req.user?._id;
  payroll.approvedAt = new Date();
  await payroll.save();

  res.json({ message: 'Payroll approved', payroll });
});

/**
 * Get payrolls (filter by status, employee, etc.)
 */
export const getPayrolls = asyncHandler(async (req, res) => {
  const { employee, status, period } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;
  if (period) query.payrollPeriod = new Date(period);

  const payrolls = await PayrollProcessing.find(query)
    .populate('employee', 'firstName lastName')
    .populate('salaryConfiguration')
    .sort({ payrollPeriod: -1 });

  res.json({ payrolls });
});


import DirectDeposit from '../../models/PayrollManagement/directDeposit.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

/**
 * Initiate direct deposit transaction
 */
export const initiateDeposit = asyncHandler(async (req, res) => {
  const { employee, bankAccount, amount, batchId } = req.body;

  if (!employee || !bankAccount || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const deposit = await DirectDeposit.create({
    employee,
    bankAccount,
    amount,
    batchId,
    initiatedBy: req.user?._id,
  });

  res.status(201).json({ message: 'Deposit initiated', deposit });
});

/**
 * Update deposit status (after payment gateway callback)
 */
export const updateDepositStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, transactionId, failureReason } = req.body;

  const deposit = await DirectDeposit.findById(id);
  if (!deposit) return res.status(404).json({ error: 'Not found' });

  deposit.status = status;
  deposit.transactionId = transactionId;
  deposit.failureReason = failureReason;
  deposit.processedBy = req.user?._id;
  deposit.processedAt = new Date();

  await deposit.save();
  res.json({ message: 'Deposit updated', deposit });
});

/**
 * Get deposits
 */
export const getDeposits = asyncHandler(async (req, res) => {
  const { employee, status, batchId } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;
  if (batchId) query.batchId = batchId;

  const deposits = await DirectDeposit.find(query)
    .populate('employee', 'firstName lastName')
    .populate('bankAccount', 'bankName accountLast4');

  res.json({ deposits });
});


import PayrollReport from '../../models/PayrollManagement/payrollReport.js';
import PayrollProcessing from '../../models/PayrollManagement/payrollProcessing.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

/**
 * Generate payroll report snapshot (monthly/yearly)
 */
export const generateReport = asyncHandler(async (req, res) => {
  const { payrollPeriod, reportType } = req.body;

  const payrolls = await PayrollProcessing.find({ payrollPeriod });
  if (!payrolls.length) return res.status(404).json({ error: 'No payroll data for this period' });

  const totalGross = payrolls.reduce((a, p) => a + parseFloat(p.grossPay), 0);
  const totalNet = payrolls.reduce((a, p) => a + parseFloat(p.netPay), 0);
  const totalDeductions = totalGross - totalNet;

  const report = await PayrollReport.create({
    payrollPeriod,
    reportType,
    totalEmployees: payrolls.length,
    totalGrossPay: totalGross,
    totalDeductions,
    totalNetPay: totalNet,
    reportDetails: payrolls.map(p => ({
      employee: p.employee,
      grossPay: p.grossPay,
      deductions: p.totalDeductions,
      netPay: p.netPay,
      payrollProcessingId: p._id,
    })),
    generatedBy: req.user?._id,
  });

  res.status(201).json({ message: 'Payroll report generated', report });
});

/**
 * Fetch reports
 */
export const getReports = asyncHandler(async (req, res) => {
  const { reportType, startDate, endDate } = req.query;
  const query = {};
  if (reportType) query.reportType = reportType;
  if (startDate && endDate)
    query.payrollPeriod = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const reports = await PayrollReport.find(query)
    .populate('generatedBy', 'firstName lastName')
    .sort({ payrollPeriod: -1 });

  res.json({ reports });
});


