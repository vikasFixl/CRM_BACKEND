import { Onboarding } from "../../../models/NHRM/employeeManagement/onboarding.js";
import {EmployeeProfile} from "../../../models/NHRM/employeeManagement/employeeProfile.js";

/**
 * Create onboarding record (if not exists)
 */
export const initiateOnboarding = async (req, res) => {
  try {
    const { organizationId, employeeId, initiatedBy } = req.body;

    // Check existing onboarding
    const existing = await Onboarding.findOne({ employeeId, organizationId });
    if (existing) return res.status(200).json(existing);

    const onboarding = await Onboarding.create({
      organizationId,
      employeeId,
      initiatedBy,
      status: "Pending",
      steps: [
        { key: "personalInfo", label: "Personal Information" },
        { key: "documents", label: "Upload Documents" },
        { key: "bankDetails", label: "Bank Details" },
      ],
      checklistProgress: { total: 3 },
    });

    res.status(201).json({ message: "Onboarding initiated", onboarding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Fetch onboarding by employee
 */
export const getOnboardingByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const onboarding = await Onboarding.findOne({ employeeId })
      .populate("assignedTo initiatedBy")
      .populate("steps.verifiedBy")
      .populate("documents.verifiedBy");

    if (!onboarding) return res.status(404).json({ message: "No onboarding found" });

    res.json(onboarding);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update step status (employee fills info)
 */
export const updateStepStatus = async (req, res) => {
  try {
    const { employeeId, stepKey } = req.params;
    const { status, note } = req.body;

    const onboarding = await Onboarding.findOne({ employeeId });
    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });

    const step = onboarding.steps.find((s) => s.key === stepKey);
    if (!step) return res.status(400).json({ message: "Invalid step key" });

    step.status = status;
    step.note = note || step.note;
    if (status === "Completed") step.completedAt = new Date();

    // Recalculate progress
    const total = onboarding.steps.length;
    const completed = onboarding.steps.filter((s) => s.status === "Completed" || s.status === "Verified").length;
    const percentage = Math.round((completed / total) * 100);

    onboarding.checklistProgress = { total, completed, percentage };
    onboarding.status = percentage === 100 ? "Completed" : "In Progress";

    await onboarding.save();

    res.json({ message: "Step updated", onboarding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Verify document or step (HR action)
 */
export const verifyStepOrDocument = async (req, res) => {
  try {
    const { employeeId, stepKey } = req.params;
    const { verifiedBy, note } = req.body;

    const onboarding = await Onboarding.findOne({ employeeId });
    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });

    const step = onboarding.steps.find((s) => s.key === stepKey);
    if (!step) return res.status(400).json({ message: "Invalid step key" });

    step.status = "Verified";
    step.verifiedAt = new Date();
    step.verifiedBy = verifiedBy;
    step.note = note;

    const total = onboarding.steps.length;
    const completed = onboarding.steps.filter((s) => s.status === "Verified").length;
    const percentage = Math.round((completed / total) * 100);

    onboarding.checklistProgress = { total, completed, percentage };
    onboarding.status = percentage === 100 ? "Completed" : "In Progress";

    await onboarding.save();

    res.json({ message: "Step verified", onboarding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete onboarding (soft delete)
 */
export const deleteOnboarding = async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { deletedBy } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) return res.status(404).json({ message: "Not found" });

    onboarding.isDeleted = true;
    onboarding.deletedAt = new Date();
    onboarding.deletedBy = deletedBy;
    await onboarding.save();

    res.json({ message: "Onboarding deleted", onboarding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
