const { getPagination } = require("../../utils/query");
const Award = require('../../models/HRM/award'); // Adjust the import path as needed

const createSingleAward = async (req, res) => {
  try {
    if (req.query.query === "deletemany") {
      // Assuming req.body contains an array of award IDs to delete
      const awardIdsToDelete = req.body;

      // Delete multiple awards by their IDs
      await Award.deleteMany({ _id: { $in: awardIdsToDelete } });

      return res.status(200).json({ message: "Awards deleted successfully" });
    } else if (req.query.query === "createmany") {
      // Create multiple awards from an array of objects
      const awardsToCreate = req.body;

      // Using insertMany to create multiple awards
      const createdAwards = await Award.insertMany(awardsToCreate);

      return res.status(201).json(createdAwards);
    } else {
      // Create a single award from an object
      const awardData = {
        name: req.body.name,
        description: req.body.description,
      };

      const createdAward = await Award.create(awardData);

      return res.status(201).json(createdAward);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getAllAward = async (req, res) => {
  try {
    const queryOptions = {};
    const { query, status } = req.query;

    if (query === "all") {
      // No specific filtering needed
    } else if (status === "false") {
      queryOptions.status = false;
    } else if (status === "true") {
      queryOptions.status = true;
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find awards based on queryOptions and apply pagination
    const awards = await Award.find(queryOptions)
      .skip(skip)
      .limit(limit)
      .sort({ id: 'asc' });

    return res.status(200).json(awards);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getSingleAward = async (req, res) => {
  try {
    const awardId = req.params.id;
    
    // Find the award by ID
    const award = await Award.findById(awardId)
      .populate({
        path: 'awardHistory',
        populate: {
          path: 'user',
          select: 'id firstName lastName userName',
        },
      })
      .exec();

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    const userIds = award.awardHistory.map(item => item.user.id);

    if (
      (req.auth.sub !== userIds[0] &&
        !req.auth.permissions.includes('readAll-award')) ||
      !req.auth.permissions.includes('readSingle-award')
    ) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json(award);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleAward = async (req, res) => {
  try {
    const awardId = req.params.id;
    
    // Find the award by ID and update its fields
    const updatedAward = await Award.findByIdAndUpdate(
      awardId,
      {
        name: req.body.name,
        description: req.body.description,
      },
      { new: true } // To return the updated document
    ).exec();

    if (!updatedAward) {
      return res.status(404).json({ message: 'Award not found' });
    }

    return res.status(200).json(updatedAward);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleAward = async (req, res) => {
  try {
    const awardId = req.params.id;

    // Find the award by ID and delete it
    const deletedAward = await Award.findByIdAndDelete(awardId).exec();

    if (!deletedAward) {
      return res.status(404).json({ message: 'Award not found' });
    }

    return res.status(200).json(deletedAward);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createSingleAward,
  getAllAward,
  getSingleAward,
  updateSingleAward,
  deleteSingleAward,
};
