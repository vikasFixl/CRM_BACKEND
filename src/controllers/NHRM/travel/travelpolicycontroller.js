import { TravelPolicy } from "../../../models/NHRM/Travel Management/TravelPolicy.js";

/**
 * @desc Create new travel policy
 * @route POST /api/travel/policies
 * @access Admin
 */
export const createTravelPolicy = async (req, res) => {
  try {
    const {
      policyName,
      maxBudget,
      allowedModes,
      applicableTo,
      internationalApprovalRequired,
    } = req.body;

    // Validate input
    if (!policyName || !maxBudget) {
      return res.status(400).json({ error: "policyName and maxBudget are required" });
    }

    // Check for duplicates
    const existing = await TravelPolicy.findOne({ policyName });
    if (existing) {
      return res.status(400).json({ error: "Policy with this name already exists" });
    }

    const policy = await TravelPolicy.create({
      policyName,
      maxBudget,
      allowedModes,
      applicableTo,
      internationalApprovalRequired,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    logger.error("Error creating travel policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Get all travel policies
 * @route GET /api/travel/policies
 * @access Admin/HR
 */
export const getTravelPolicies = async (req, res) => {
  try {
    const { applicableTo } = req.query;
    const query = {};

    if (applicableTo) query.applicableTo = applicableTo;

    const policies = await TravelPolicy.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    logger.error("Error fetching travel policies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Get single travel policy by ID
 * @route GET /api/travel/policies/:id
 * @access Admin/HR
 */
export const getTravelPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await TravelPolicy.findById(id);
    if (!policy) return res.status(404).json({ error: "Travel policy not found" });

    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    logger.error("Error fetching travel policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Update travel policy
 * @route PUT /api/travel/policies/:id
 * @access Admin
 */
export const updateTravelPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date();

    const policy = await TravelPolicy.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!policy) return res.status(404).json({ error: "Travel policy not found" });

    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    logger.error("Error updating travel policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Delete travel policy
 * @route DELETE /api/travel/policies/:id
 * @access Admin
 */
export const deleteTravelPolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await TravelPolicy.findByIdAndDelete(id);
    if (!policy) return res.status(404).json({ error: "Travel policy not found" });

    res.status(200).json({ success: true, message: "Policy deleted successfully" });
  } catch (error) {
    logger.error("Error deleting travel policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
