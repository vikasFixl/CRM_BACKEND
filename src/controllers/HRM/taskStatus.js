const TaskStatus = require('../../models/HRM/taskStatus'); // Adjust the import path as needed


//create taskStatus controller. This controller will create a new taskStatus in the database and return the created taskStatus. here is only one column in the taskStatus table which is name.
const createTaskStatus = async (req, res) => {
  try {
    // Create a new task status document
    const taskStatus = new TaskStatus({
      projectId: req.body.projectId,
      name: req.body.name,
    });

    // Save the task status to the database
    await taskStatus.save();

    return res.status(201).json(taskStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//get all taskStatus controller. This controller will return all taskStatus in the database.
const getAllTaskStatus = async (req, res) => {
  try {
    if (req.query.query === "all") {
      // Fetch all task statuses
      const taskStatus = await TaskStatus.find().sort({ _id: 'asc' });
      return res.status(200).json(taskStatus);
    } else if (req.query.status === "true") {
      // Fetch task statuses with status true
      const taskStatus = await TaskStatus.find({ status: true }).sort({ _id: 'asc' });
      return res.status(200).json(taskStatus);
    } else if (req.query.status === "false") {
      // Fetch task statuses with status false
      const taskStatus = await TaskStatus.find({ status: false }).sort({ _id: 'asc' });
      return res.status(200).json(taskStatus);
    } else {
      return res.status(400).json({ message: "Invalid query parameter" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//get taskStatus by id controller. This controller will return a taskStatus by id.
const getTaskStatusById = async (req, res) => {
  try {
    // Find the task status by ID
    const taskStatus = await TaskStatus.findById(req.params.id).populate('task');
    
    if (!taskStatus) {
      return res.status(404).json({ message: "Task status not found" });
    }

    return res.status(200).json(taskStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//get taskStatus by projectId controller. This controller will return a taskStatus by projectId.
const getTaskStatusByProjectId = async (req, res) => {
  try {
    // Find task statuses by project ID
    const taskStatus = await TaskStatus.find({ projectId: parseInt(req.params.id) })
      .populate({
        path: 'project',
        select: 'milestone.name',
      })
      .populate({
        path: 'task',
        populate: {
          path: 'priority',
          select: 'name',
        },
      });

    if (!taskStatus) {
      return res.status(404).json({ message: "Task statuses not found" });
    }

    return res.status(200).json(taskStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//update taskStatus controller. This controller will update a taskStatus by id and return the updated taskStatus.
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, name } = req.body;

    // Find and update the task status by ID
    const updatedTaskStatus = await TaskStatus.findByIdAndUpdate(
      id,
      { projectId, name },
      { new: true } // Return the updated document
    );

    if (!updatedTaskStatus) {
      return res.status(404).json({ message: "Task status not found" });
    }

    return res.status(200).json(updatedTaskStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//delete taskStatus controller. This controller will delete a taskStatus by id.
const deleteTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the task status by ID
    const deletedTaskStatus = await TaskStatus.findByIdAndRemove(id);

    if (!deletedTaskStatus) {
      return res.status(404).json({ message: "Task status not found" });
    }

    return res.status(200).json(deletedTaskStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTaskStatus,
  getAllTaskStatus,
  getTaskStatusById,
  getTaskStatusByProjectId,
  updateTaskStatus,
  deleteTaskStatus,
};
