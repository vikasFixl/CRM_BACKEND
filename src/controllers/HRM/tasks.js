const { getPagination } = require("../../utils/query");
//create tasks controller
// Import your Mongoose models here
const Task = require('../../models/HRM/task'); // Adjust the import path as needed

const createTask = async (req, res) => {
  try {
    const {
      projectId,
      milestoneId,
      name,
      startDate,
      endDate,
      description,
      completionTime,
      priorityId,
      taskStatusId,
      assignedTask,
    } = req.body;

    // Create a new task
    const newTask = new Task({
      project: projectId, // Assuming project is a reference to the Project model
      milestone: milestoneId, // Assuming milestone is a reference to the Milestone model
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      completionTime: parseFloat(completionTime),
      priority: priorityId, // Assuming priority is a reference to the Priority model
      taskStatus: taskStatusId, // Assuming taskStatus is a reference to the TaskStatus model
      assignedTask: assignedTask
        ? assignedTask.map((userId) => Number(userId))
        : [],
    });

    // Save the new task to the database
    const savedTask = await newTask.save();

    return res.status(201).json(savedTask);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


//get all tasks controller
const getAllTasks = async (req, res) => {
  try {
    let queryOptions = {};

    if (req.query.query === "all") {
      // Return all tasks
      queryOptions = {};
    } else if (req.query.status === "true") {
      // Return tasks with status true
      queryOptions = { status: true };
    } else if (req.query.status === "false") {
      // Return tasks with status false
      queryOptions = { status: false };
    }

    const allTasks = await Task.find(queryOptions).sort({ id: 'desc' });
    return res.status(200).json(allTasks);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
//get task by id controller
const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the task by ID and populate related fields as needed
    const task = await Task.findById(taskId)
      .populate('project')
      .populate('milestone')
      .populate('priority')
      .populate('taskStatus');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


//update task controller
const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const updateFields = {};

  try {
    if (req.query.query === 'all') {
      updateFields.milestoneId = req.body.milestoneId;
      updateFields.name = req.body.name;
      updateFields.startDate = new Date(req.body.startDate);
      updateFields.endDate = new Date(req.body.endDate);
      updateFields.description = req.body.description;
      updateFields.completionTime = parseFloat(req.body.completionTime);
      updateFields.description = req.body.description;
    } else if (req.query.query === 'status') {
      updateFields.status = req.body.status;
    } else if (req.query.query === 'priority') {
      updateFields.priorityId = req.body.priorityId;
    } else if (req.query.query === 'milestone') {
      updateFields.milestoneId = req.body.milestoneId;
    } else if (req.query.query === 'taskStatus') {
      updateFields.taskStatusId = req.body.taskStatusId;
    } else {
      return res.status(400).json({ message: 'Invalid query parameter' });
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateFields, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//delete task controller
const deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    // Use Mongoose's findByIdAndRemove to delete the task
    const deletedTask = await Task.findByIdAndRemove(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(deletedTask);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
