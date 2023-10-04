const calculatePayslip = require("../../utils/calculatePayslip");
const Payslip = require('../../models/HRM/payslip'); // Import the Mongoose Payslip model

//create a new employee
const calculatePayroll = async (req, res) => {
  try {
    const { salaryMonth, salaryYear } = req.query;
    const allEmployeeSalary = await calculatePayslip(salaryMonth, salaryYear);

    return res.status(200).json(allEmployeeSalary);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
};

const generatePayslip = async (req, res) => {
  try {
    // Map the request body and create an array of payslip documents
    const payslipData = req.body.map((item) => ({
      userId: item.userId,
      salaryMonth: item.salaryMonth,
      salaryYear: item.salaryYear,
      salary: item.salary,
      paidLeave: item.paidLeave,
      unpaidLeave: item.unpaidLeave,
      monthlyHoliday: item.monthlyHoliday,
      publicHoliday: item.publicHoliday,
      workDay: item.workDay,
      shiftWiseWorkHour: item.shiftWiseWorkHour,
      monthlyWorkHour: item.monthlyWorkHour,
      hourlySalary: item.hourlySalary,
      workingHour: item.workingHour,
      salaryPayable: item.salaryPayable,
      bonus: item.bonus,
      bonusComment: item.bonusComment,
      deduction: item.deduction,
      deductionComment: item.deductionComment,
      totalPayable: item.totalPayable + item.bonus - item.deduction,
    }));

    // Insert payslip documents into the Mongoose Payslip model
    const payslips = await Payslip.create(payslipData);

    return res.status(200).json(payslips);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
};

const getAllPayslip = async (req, res) => {
  if (req.query.value === "monthWise") {
    const { paymentStatus, salaryMonth, salaryYear } = req.query;
    try {
      const allPayslip = await Payslip.find({
        salaryMonth: parseInt(salaryMonth),
        salaryYear: parseInt(salaryYear),
        paymentStatus: paymentStatus,
      })
        .populate('user', 'firstName lastName id')
        .sort({ id: 'desc' });

      return res.status(200).json(allPayslip);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      const allPayslip = await Payslip.find({})
        .populate('user', 'firstName lastName id')
        .sort({ id: 'desc' });

      return res.status(200).json(allPayslip);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSinglePayslip = async (req, res) => {
  try {
    const singlePayslip = await Payslip.findOne({
      _id: req.params.id, // Assuming "_id" is the identifier field for payslips in MongoDB
    }).populate('user', '-password');

    if (!singlePayslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    return res.status(200).json(singlePayslip);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updatePayslip = async (req, res) => {
  try {
    const payslipId = req.params.id;
    
    // Find the payslip by ID and update the specified fields
    const updatedPayslip = await Payslip.findByIdAndUpdate(
      payslipId,
      {
        bonus: req.body.bonus,
        bonusComment: req.body.bonusComment,
        deduction: req.body.deduction,
        deductionComment: req.body.deductionComment,
      },
      { new: true } // Return the updated payslip after the update
    );

    if (!updatedPayslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    return res.status(200).json(updatedPayslip);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// make payment to the payslip and update the payment status
const makePayment = async (req, res) => {
  try {
    const payslipId = req.params.id;

    // Check if the payslip is already paid
    const checkPayslip = await Payslip.findById(payslipId);
    if (checkPayslip.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Payslip already paid" });
    }

    // Update the payslip's paymentStatus to "PAID"
    const updatedPayslip = await Payslip.findByIdAndUpdate(
      payslipId,
      { paymentStatus: "PAID" },
      { new: true } // Return the updated payslip after the update
    ).populate('user', 'firstName lastName id'); // Populate the 'user' field

    // Create a transaction record
    const transaction = new Transaction({
      date: new Date(),
      debit_id: 10, // Update with the appropriate debit account ID
      credit_id: 1, // Update with the appropriate credit account ID
      particulars: `Salary paid to ${updatedPayslip.user.firstName} ${updatedPayslip.user.lastName} for the month of ${updatedPayslip.salaryMonth}-${updatedPayslip.salaryYear}`,
      amount: updatedPayslip.totalPayable,
      type: "salary",
      related_id: updatedPayslip.id,
    });

    // Save the transaction record to the database
    await transaction.save();

    return res.status(200).json({ updatedPayslip, transaction });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  calculatePayroll,
  generatePayslip,
  getAllPayslip,
  getSinglePayslip,
  updatePayslip,
  makePayment,
};
