import { Position } from "../../../models/NHRM/employeeManagement/postition.js";

// Create Position
export const createPosition = async (req, res) => {
  const { orgId } = req.orgUser;
  const { userId } = req.user
  const { department, title, level, description } = req.body;
  try {
    const position = await Position.create({ organizationId: orgId, department, title, level, description, createdBy: userId });
    res.status(201).json({ message: "Position created successfully", position });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Positions (by organization or department)
export const getPositions = async (req, res) => {
  const { departmentId } = req.query;
  const organizationId = req.orgUser.orgId;
  const filter = { isActive: true };
  if (organizationId) filter.organizationId = organizationId;
  if (departmentId) filter.department = departmentId;

  try {
    const positions = await Position.find(filter).populate("department", "name ").sort({ createdAt: -1 });
    res.json({ message: "Positions retrieved successfully", positions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Position
export const getPosition = async (req, res) => {
  const { positionId: id } = req.params;
  const organizationId = req.orgUser.orgId;
  try {
    const position = await Position.find({ organizationId, _id: id, isActive: true }).populate("department");
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.json({ message: "Position retrieved successfully", position });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Position
export const updatePosition = async (req, res) => {
  const { positionId: id } = req.params;
  const { department, title, level, description } = req.body;
  const organizationId = req.orgUser?.orgId;

  try {
    // Validate organizationId presence
    if (!organizationId) {
      return res.status(403).json({ message: "Unauthorized: No organization ID found" });
    }

    // Find position and make sure it belongs to this organization
    const position = await Position.findOne({ _id: id, organizationId, isActive: true });
    if (!position) {
      return res.status(404).json({ message: "Position not found or access denied" });
    }

    // Update allowed fields only
    if (department) position.department = department;
    if (title) position.title = title;
    if (level) position.level = level;
    if (description) position.description = description;

    // Save updated position
    const updatedPosition = await position.save();
    res.status(200).json({
      message: "Position updated successfully",
      position: updatedPosition,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Delete Position
export const deletePosition = async (req, res) => {
  const { positionId: id } = req.params;
  const organizationId = req.orgUser?.orgId;
  try {
    const position = await Position.findOneAndDelete({ _id: id, organizationId });
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.json({ message: "Position deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const TogglePositionStatus = async (req, res) => {
  const { positionId: id } = req.params;
  const { isActive } = req.body;
  const organizationId = req.orgUser?.orgId;
  try {
    const position = await Position.findOne({ _id: id, organizationId });
    if (!position) return res.status(404).json({ message: "Position not found" });
    position.isActive = isActive;
    await position.save();
    res.json({ message: `Position ${isActive ? "activated" : "deactivated"} successfully`, position });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};
