//create projectTeam controller
// Import your Mongoose models for Project, ProjectTeam, and User here
const Project = require('../../models/HRM/project');
const ProjectTeam = require('../../models/HRM/projectTeam');

const createProjectTeam = async (req, res) => {
  try {
    const { projectTeamName, projectId, projectTeamMember } = req.body;

    // Find the project by its ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Create the project team
    const newProjectTeam = new ProjectTeam({
      projectTeamName,
      project: projectId, // Assign the project by its ID
      projectTeamMember: projectTeamMember.map((userId) => userId), // Assign members by their IDs
    });

    // Save the project team to the database
    await newProjectTeam.save();

    // Populate the project team with project and user details
    await newProjectTeam.populate('project').populate('projectTeamMember').execPopulate();

    return res.status(201).json(newProjectTeam);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


//get all projectTeam controller
const getAllProjectTeam = async (req, res) => {
  try {
    let query = {};

    if (req.query.query === 'all') {
      // Return all project teams
    } else if (req.query.status === 'true') {
      query = { status: true };
    } else if (req.query.status === 'false') {
      query = { status: false };
    }

    // Find project teams based on the query
    const projectTeams = await ProjectTeam.find(query).sort({ id: 'asc' });

    return res.status(200).json(projectTeams);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//get projectTeam by id controller
const getProjectTeamById = async (req, res) => {
  try {
    const projectTeamId = parseInt(req.params.id);

    // Find the project team by ID
    const projectTeam = await ProjectTeam.findById(projectTeamId)
      .populate({
        path: 'project',
        select: 'id name',
        populate: {
          path: 'projectManager',
          select: 'id firstName lastName',
        },
      })
      .populate({
        path: 'projectTeamMember',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        },
      });

    if (!projectTeam) {
      return res.status(404).json({ message: 'Project team not found' });
    }

    return res.status(200).json(projectTeam);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


//get projectTeam by project id controller

const getProjectTeamByProjectId = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the project teams associated with the project
    const projectTeams = await ProjectTeam.find({ projectId })
      .populate({
        path: 'projectTeamMember',
        populate: {
          path: 'user',
          select: 'id firstName lastName',
        },
      });

    return res.status(200).json(projectTeams);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//update projectTeam controller
const updateProjectTeam = async (req, res) => {
  try {
    const projectTeamId = parseInt(req.params.id);

    // Check if the project team exists
    const existingProjectTeam = await ProjectTeam.findById(projectTeamId);
    if (!existingProjectTeam) {
      return res.status(404).json({ message: 'Project team not found' });
    }

    if (req.query.query === "all") {
      // Update project team details
      existingProjectTeam.projectTeamName = req.body.projectTeamName;

      // Connect the project
      const projectId = parseInt(req.body.projectId);
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(400).json({ message: 'Project not found' });
      }
      existingProjectTeam.project = projectId;

      // Create or update project team members
      const projectTeamMemberIds = req.body.projectTeamMember.map(Number);
      const users = await User.find({ _id: { $in: projectTeamMemberIds } });
      if (users.length !== projectTeamMemberIds.length) {
        return res.status(400).json({ message: 'One or more project team members not found' });
      }
      existingProjectTeam.projectTeamMember = projectTeamMemberIds;

      // Save the updated project team
      const updatedProjectTeam = await existingProjectTeam.save();

      return res.status(200).json(updatedProjectTeam);
    } else if (req.query.query === "status") {
      // Update project team status
      existingProjectTeam.status = req.body.status;

      // Save the updated project team
      const updatedProjectTeam = await existingProjectTeam.save();

      return res.status(200).json(updatedProjectTeam);
    } else {
      return res.status(400).json({ message: 'Invalid query' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//delete projectTeam controller
const deleteProjectTeam = async (req, res) => {
  try {
    const projectTeamId = parseInt(req.params.id);

    // Check if the project team exists
    const existingProjectTeam = await ProjectTeam.findById(projectTeamId);
    if (!existingProjectTeam) {
      return res.status(404).json({ message: 'Project team not found' });
    }

    // Update project team status to "DELETED"
    existingProjectTeam.status = "DELETED";

    // Save the updated project team
    const deletedProjectTeam = await existingProjectTeam.save();

    return res.status(200).json(deletedProjectTeam);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createProjectTeam,
  getAllProjectTeam,
  getProjectTeamById,
  getProjectTeamByProjectId,
  updateProjectTeam,
  deleteProjectTeam,
};
