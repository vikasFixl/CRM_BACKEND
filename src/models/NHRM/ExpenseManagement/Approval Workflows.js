// Approval Workflowsimport mongoose from 'mongoose';
const { Schema } = mongoose;

const approvalWorkflowSchema = new Schema({
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseSubmission',
    required: true,
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  action: {
    type: String,
    enum: ['Approved', 'Rejected', 'Pending'],
    default: 'Pending',
  },
  comments: String,
  actionDate: Date,
  sequence: Number, // step in the workflow (1st, 2nd approver etc.)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

approvalWorkflowSchema.index({ expense: 1, approver: 1 });

const ApprovalWorkflow = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);

export default ApprovalWorkflow;
