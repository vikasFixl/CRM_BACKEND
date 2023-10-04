const Priority = require('../../models/HRM/priority'); // Adjust the import path as needed

//create single priority controller
const createSinglePriority = async (req, res) => {
  if (req.query.query === 'createmany') {
    try {
      const priorityData = req.body.map((priority) => ({
        name: priority.name,
      }));

      const createdPriorities = await Priority.insertMany(priorityData, {
        ordered: false,
      });

      return res.status(201).json(createdPriorities);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      const priority = new Priority({
        name: req.body.name,
      });

      const createdPriority = await priority.save();

      return res.status(201).json(createdPriority);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
};

//get all priority controller
const getAllPriority = async (req, res) => {
  if (req.query.query === 'all') {
    try {
      const allPriorities = await Priority.find({});
      return res.status(200).json(allPriorities);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
};

//get single priority controller
const getSinglePriority = async (req, res) => {
  try {
    const priorityId = req.params.id;

    // Use Mongoose to find a single priority by its ID
    const singlePriority = await Priority.findById(priorityId);

    if (!singlePriority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    return res.status(200).json(singlePriority);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//update single priority controller
const updateSinglePriority = async (req, res) => {
  try {
    const priorityId = req.params.id;
    const { name } = req.body;

    // Use Mongoose to update the priority by its ID
    const updatedPriority = await Priority.findByIdAndUpdate(
      priorityId,
      { name },
      { new: true } // To return the updated document
    );

    if (!updatedPriority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    return res.status(200).json(updatedPriority);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//delete single priority controller
const deleteSinglePriority = async (req, res) => {
  try {
    const priorityId = req.params.id;

    // Use Mongoose to delete the priority by its ID
    const deletedPriority = await Priority.findByIdAndDelete(priorityId);

    if (!deletedPriority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    return res.status(200).json(deletedPriority);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSinglePriority,
  getAllPriority,
  getSinglePriority,
  updateSinglePriority,
  deleteSinglePriority,
};
