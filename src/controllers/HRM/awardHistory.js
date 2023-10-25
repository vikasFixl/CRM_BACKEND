const AwardHistory = require('../../models/HRM/awardHistory'); // Adjust the import path as needed

const createSingleAwardHistory = async (req, res) => {
  try {
    if (req.query.query === "deletemany") {
      // Delete many announcements at once
      const deletedAnnouncement = await AwardHistory.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedAnnouncement);
    // }
    // if (req.query.query === "deletemany") {
      // Handle delete many AwardHistory here if needed
      // You can use Mongoose's delete methods
      // Make sure to validate and sanitize input before performing the delete operation
      // Example: AwardHistory.deleteMany({ _id: { $in: req.body } }, (err) => { /* Handle errors */ });
      // return res.status(400).json({ message: 'Delete many not supported yet' });
    } else {
      const awardHistoryData = {
        userId: req.body.userId,
        awardId: req.body.awardId,
        awardedDate: new Date(req.body.awardedDate),
        comment: req.body.comment,
      };

      // Create a new AwardHistory document using Mongoose
      const createdAwardHistory = await AwardHistory.create(awardHistoryData);

      return res.status(201).json(createdAwardHistory);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getAllAwardHistory = async (req, res) => {
  try {
    const allAwardHistory = await AwardHistory.find().sort({ id: 'asc' }).exec();

    return res.json(allAwardHistory);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getSingleAwardHistory = async (req, res) => {
  try {
    const singleAwardHistory = await AwardHistory.findById(req.params.id).exec();

    if (!singleAwardHistory) {
      return res.status(404).json({ message: 'Award history not found' });
    }

    return res.json(singleAwardHistory);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleAwardHistory = async (req, res) => {
  try {
    const awardHistoryId = req.params.id;

    // Check if the award history record exists
    const existingAwardHistory = await AwardHistory.findById(awardHistoryId).exec();

    if (!existingAwardHistory) {
      return res.status(404).json({ message: 'Award history not found' });
    }

    // Update the award history record
    existingAwardHistory.awardId = req.body.awardId;
    existingAwardHistory.awardedDate = new Date(req.body.awardedDate);
    existingAwardHistory.comment = req.body.comment;

    // Save the updated record
    const updatedAwardHistory = await existingAwardHistory.save();

    return res.json(updatedAwardHistory);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleAwardHistory = async (req, res) => {
  try {
    const awardHistoryId = req.params.id;

    // Check if the award history record exists
    const existingAwardHistory = await AwardHistory.findById(awardHistoryId).exec();

    if (!existingAwardHistory) {
      return res.status(404).json({ message: 'Award history not found' });
    }

    // Delete the award history record
    const deletedAwardHistory = await AwardHistory.findByIdAndRemove(awardHistoryId).exec();

    return res.status(200).json(deletedAwardHistory);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleAwardHistory,
  getAllAwardHistory,
  getSingleAwardHistory,
  updateSingleAwardHistory,
  deleteSingleAwardHistory,
};
