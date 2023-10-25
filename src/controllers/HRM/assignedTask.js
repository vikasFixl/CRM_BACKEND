const { getPagination } = require("../../utils/query");
//create assignedTask controller
// Import your Mongoose models here
const AssignedTask = require('../../models/HRM/assignedTask'); // Adjust the import path as needed
const Task = require('../../models/HRM/task');
const ProjectTeam = require('../../models/HRM/projectTeam');

const createAssignedTask = async (req, res) => {
  try {
    const taskId = req.body.taskId;
    const projectTeamId = req.body.projectTeamId;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    // Check if the task and project team exist, and create the assigned task
    const [task, projectTeam] = await Promise.all([
      Task.findById(taskId),
      ProjectTeam.findById(projectTeamId),
    ]);

    if (!task || !projectTeam) {
      return res.status(404).json({ message: 'Task or Project Team not found' });
    }

    const assignedTask = new AssignedTask({
      task: task,
      projectTeam: projectTeam,
      startDate: startDate,
      endDate: endDate,
    });

    const savedAssignedTask = await assignedTask.save();

    return res.status(201).json(savedAssignedTask);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


//get all assignedTask controller
const getAllAssignedTask = async (req, res) => {
  if (req.query.query === 'all') {
    try {
      const assignedTasks = await AssignedTask.find().sort({ _id: 'desc' });
      return res.status(200).json(assignedTasks);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};


//get assignedTask by id controller
const getAssignedTaskById = async (req, res) => {
  try {
    const assignedTask = await AssignedTask.findById(req.params.id)
      .populate({
        path: 'projectTeam',
        select: 'user',
        populate: {
          path: 'user',
          select: 'id firstName lastName',
        },
      })
      .populate('task');

    if (!assignedTask) {
      return res.status(404).json({ message: 'Assigned task not found' });
    }

    return res.status(200).json(assignedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//update assignedTask controller
const updateAssignedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId, projectTeamId, startDate, endDate } = req.body;

    const assignedTask = await AssignedTask.findByIdAndUpdate(
      id,
      {
        task: taskId,
        projectTeam: projectTeamId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      { new: true }
    )
      .populate({
        path: 'projectTeam',
        select: 'user',
        populate: {
          path: 'user',
          select: 'id firstName lastName',
        },
      })
      .populate('task');

    if (!assignedTask) {
      return res.status(404).json({ message: 'Assigned task not found' });
    }

    return res.status(200).json(assignedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//delete assignedTask controller
const deleteAssignedTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const assignedTask = await AssignedTask.findOneAndUpdate(
      { id: taskId },
      { status: false },
      { new: true } // To return the updated document
    );

    if (!assignedTask) {
      return res.status(404).json({ message: "Assigned task not found" });
    }

    return res.status(200).json(assignedTask);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createAssignedTask,
  getAllAssignedTask,
  getAssignedTaskById,
  updateAssignedTask,
  deleteAssignedTask,
};
