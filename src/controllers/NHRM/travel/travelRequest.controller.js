import { TravelPolicy } from "../../../models/NHRM/Travel Management/TravelPolicy.js";
import { TravelRequest } from "../../../models/NHRM/Travel Management/TravelRequest.js";

// Create a travel request
export const createTravelRequest = async (req, res) => {
  try {
    const {
      destination,
      purpose,
      travelType,
      departureDate,
      returnDate,
      modeOfTransport,
      estimatedCost,
      notes,
    } = req.body;

    // Validation
    if (!destination || !purpose || !departureDate || !returnDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (new Date(returnDate) < new Date(departureDate)) {
      return res.status(400).json({ error: 'Return date cannot be before departure date' });
    }

    // Get employee ID from token or body
    const employeeId = req.user?._id || req.body.employee;

    // Find applicable policy
    const policy = await TravelPolicy.findOne({ active: true });
    if (!policy) {
      return res.status(400).json({ error: 'No active travel policy found' });
    }

    // Policy check (basic)
    const travelPolicyMatched = estimatedCost <= policy.maxBudget;
    const policyReason = travelPolicyMatched ? '' : 'Estimated cost exceeds allowed budget';

    const newRequest = await TravelRequest.create({
      employee: employeeId,
      destination,
      purpose,
      travelType,
      departureDate,
      returnDate,
      modeOfTransport,
      estimatedCost,
      travelPolicy: policy._id,
      travelPolicyMatched,
      policyReason,
      createdBy: employeeId,
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    logger.error('Error creating travel request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all travel requests (with filters)
export const getTravelRequests = async (req, res) => {
  try {
    const { employeeId, status, travelType, startDate, endDate } = req.query;

    const query = {};
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    if (travelType) query.travelType = travelType;

    if (startDate && endDate) {
      query.departureDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Employees see only their requests
    if (req.user?.role === 'employee') {
      query.employee = req.user._id;
    }

    const requests = await TravelRequest.find(query)
      .populate('employee approver travelPolicy', 'name email policyName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    logger.error('Error fetching travel requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single travel request
export const getTravelRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await TravelRequest.findById(id)
      .populate('employee approver travelPolicy', 'name email policyName');

    if (!request) return res.status(404).json({ error: 'Travel request not found' });

    // Restrict employees to their own requests
    if (req.user.role === 'employee' && request.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error('Error fetching travel request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or reject a travel request
export const updateTravelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const request = await TravelRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Travel request not found' });

    if (['Approved', 'Rejected'].includes(request.status)) {
      return res.status(400).json({ error: 'Request already finalized' });
    }

    request.status = action;
    request.approver = req.user._id;
    request.approvedDate = new Date();
    request.notes = comment || '';

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error('Error updating travel status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
