const DesignationHistory = require('../../models/HRM/designationHistory'); // Import your Mongoose model

const createSingleDesignationHistory = async (req, res) => {
  try {
    if (req.query.query === 'deletemany') {
      const deletedDesignationHistory = await DesignationHistory.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedDesignationHistory);
    } else if (req.query.query === 'createmany') {
      const createdDesignationHistory = await DesignationHistory.create(req.body);
      return res.status(201).json(createdDesignationHistory);
    } else {
      const createdDesignationHistory = await DesignationHistory.create({
        user: req.body.userId,
        designation: req.body.designationId,
        startDate: new Date(req.body.designationStartDate),
        endDate: req.body.designationEndDate
          ? new Date(req.body.designationEndDate)
          : undefined,
        comment: req.body.designationComment,
      });
      return res.status(201).json(createdDesignationHistory);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllDesignationHistory = async (req, res) => {
  try {
    const allDesignationHistory = await DesignationHistory.find().sort({ id: 'asc' });
    return res.status(200).json(allDesignationHistory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getSingleDesignationHistory = async (req, res) => {
  try {
    const singleDesignationHistory = await DesignationHistory.findOne({
      _id: req.params.id,
    });
    
    if (!singleDesignationHistory) {
      return res.status(404).json({ message: 'Designation History not found' });
    }

    return res.status(200).json(singleDesignationHistory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleDesignationHistory = async (req, res) => {
  try {
    const designationHistoryId = req.params.id;

    // Construct the update data based on the request body
    const updateData = {
      designationId: req.body.designationId,
      startDate: new Date(req.body.designationStartDate),
      endDate: req.body.designationEndDate ? new Date(req.body.designationEndDate) : undefined,
      comment: req.body.designationComment,
    };

    const updatedDesignationHistory = await DesignationHistory.findByIdAndUpdate(
      designationHistoryId,
      updateData,
      { new: true }
    );

    if (!updatedDesignationHistory) {
      return res.status(404).json({ message: 'Designation History not found' });
    }

    return res.status(200).json(updatedDesignationHistory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleDesignationHistory = async (req, res) => {
  try {
    const designationHistoryId = req.params.id;

    const deletedDesignationHistory = await DesignationHistory.findByIdAndRemove(
      designationHistoryId
    );

    if (!deletedDesignationHistory) {
      return res.status(404).json({ message: 'Designation History not found' });
    }

    return res.status(200).json(deletedDesignationHistory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleDesignationHistory,
  getAllDesignationHistory,
  getSingleDesignationHistory,
  updateSingleDesignationHistory,
  deleteSingleDesignationHistory,
};
