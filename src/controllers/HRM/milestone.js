// Import your Mongoose model for milestones here
const Milestone = require('../../models/HRM/milestone'); // Adjust the import path as needed

const createMilestone = async (req, res) => {
  try {
    const { projectId, name, startDate, endDate, description } = req.body;
    // Create a new milestone document using the Mongoose model
    const milestone = new Milestone({
      project: projectId, // Assuming "project" is a reference to a Project model
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
    });
    // Save the new milestone to the database
    await milestone.save();
    return res.status(201).json(milestone);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//get all milestones controller
const getAllMilestones = async (req, res) => {
  try {
    const { query, status } = req.query;

    let queryConditions = {};

    // Apply filtering conditions based on query and status parameters
    if (query === 'all') {
      // No additional conditions
    } else if (status === 'PROGRESS' || status === 'ONHOLD' || status === 'COMPLETED') {
      queryConditions.status = status;
    } else {
      return res.status(400).json({ message: 'Invalid query or status parameter.' });
    }

    const allMilestones = await Milestone.find(queryConditions)
      .sort({ _id: 'desc' })
      .populate('project', 'name'); // Assuming "project" is a reference to a Project model

    return res.status(200).json(allMilestones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//get milestone by id controller

const getMilestoneById = async (req, res) => {
  try {
    const milestoneId = req.params.id;

    const milestone = await Milestone.findById(milestoneId).populate('project', 'name');

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    return res.status(200).json(milestone);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//get milestone by project id controller
const getMilestoneByProjectId = async (req, res) => {
  try {
    const projectId = req.params.id;

    const milestones = await Milestone.find({ projectId }).populate('project', 'name');

    return res.status(200).json(milestones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//update milestone controller
const updateMilestone = async (req, res) => {
  const milestoneId = req.params.id;
  const updateData = {};

  if (req.query.query === 'all') {
    updateData.name = req.body.name;
    updateData.startDate = new Date(req.body.startDate);
    updateData.endDate = new Date(req.body.endDate);
    updateData.description = req.body.description;
  } else if (req.query.query === 'status') {
    updateData.status = req.body.status;
  }

  try {
    const updatedMilestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      updateData,
      { new: true }
    );

    if (!updatedMilestone) {
      return res.status(400).json({ message: 'Milestone not found' });
    }

    return res.status(200).json(updatedMilestone);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//delete milestone controller
const deleteMilestone = async (req, res) => {
  const milestoneId = req.params.id;

  try {
    // Update the milestone status to "DELETED"
    const updatedMilestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      { status: 'DELETED' },
      { new: true }
    );

    if (!updatedMilestone) {
      return res.status(400).json({ message: 'Milestone not found' });
    }

    return res.status(200).json(updatedMilestone);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createMilestone,
  getAllMilestones,
  getMilestoneById,
  getMilestoneByProjectId,
  updateMilestone,
  deleteMilestone,
};
