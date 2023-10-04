const { getPagination } = require("../../utils/query");

// Import your Mongoose models here
const Project = require("../../models/HRM/project"); // Adjust the import path as needed
const TaskStatus = require("../../models/HRM/taskStatus"); // Adjust the import path as needed

const createProject = async (req, res) => {
  try {
    // Create a new project using Mongoose model
    const project = new Project({
      projectManager: req.body.projectManagerId, // Assuming projectManagerId is the reference to a user or manager
      name: req.body.name,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      description: req.body.description,
    });

    // Save the project to the database
    await project.save();

    // Create task statuses for the project
    const taskStatuses = [
      { name: "TODO", projectId: project._id },
      { name: "IN PROGRESS", projectId: project._id },
      { name: "DONE", projectId: project._id },
    ];

    await TaskStatus.insertMany(taskStatuses, { ordered: false });

    return res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//get all projects controller

const getAllProjects = async (req, res) => {
  const { query, status } = req.query;

  try {
    let queryConditions = {};
    const sortOptions = { id: -1 }; // Sort by id in descending order (assuming id is a unique identifier)

    if (query === "all") {
      // Fetch all projects regardless of status
    } else if (status === "PROGRESS" || status === "ONHOLD" || status === "COMPLETED") {
      queryConditions = { status };
    } else {
      return res.status(400).json({ message: "Invalid status query." });
    }

    const { skip, limit } = getPagination(req.query);

    const projects = await Project.find(queryConditions)
      .sort(sortOptions)
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('projectManager', 'firstName lastName');

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//get project by id controller
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Use Mongoose to find a project by its ID and populate related data
    const project = await Project.findById(projectId)
      // .populate('milestone')
      // .populate({
      //   path: 'projectTeam',
      //   populate: {
      //     path: 'projectTeamMember',
      //     populate: {
      //       path: 'user',
      //       select: 'firstName lastName',
      //     },
      //   },
      // })
      // .populate({
      //   path: 'task',
      //   populate: {
      //     path: 'taskStatus',
      //   },
      // });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getProjectById;


//update project controller
const updateProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project fields
    project.projectManager = req.body.projectManagerId;
    project.name = req.body.name;
    project.startDate = new Date(req.body.startDate);
    project.endDate = new Date(req.body.endDate);
    project.description = req.body.description;
    project.status = req.body.status;

    // Save the updated project
    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//delete project controller
const deleteProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project status to "DELETED"
    project.status = 'DELETED';

    // Save the updated project
    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
