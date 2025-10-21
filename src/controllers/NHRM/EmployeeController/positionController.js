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
  const { organizationId, departmentId } = req.query;
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  if (departmentId) filter.department = departmentId;

  try {
    const positions = await Position.find(filter).populate("department");
    res.json(positions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Position
export const getPosition = async (req, res) => {
  const { id } = req.params;
  try {
    const position = await Position.findById(id).populate("department");
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.json(position);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Position
export const updatePosition = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const position = await Position.findByIdAndUpdate(id, updates, { new: true });
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.json(position);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Position
export const deletePosition = async (req, res) => {
  const { id } = req.params;
  try {
    const position = await Position.findByIdAndDelete(id);
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.json({ message: "Position deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
