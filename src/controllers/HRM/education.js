const { getPagination } = require("../../utils/query");
// Import your Mongoose models for Education here
const Education = require('../../models/HRM/education'); // Adjust the import path as needed

const createSingleEducation = async (req, res) => {
  try {
    if (req.query.query === "deletemany") {
      // Delete multiple education records by IDs
      const deletedEducation = await Education.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedEducation);
    } else if (req.query.query === "createmany") {
      // Create multiple education records
      const educationData = req.body.map((education) => ({
        userId: education.userId,
        degree: education.degree,
        institution: education.institution,
        fieldOfStudy: education.fieldOfStudy,
        result: education.result,
        startDate: new Date(education.studyStartDate),
        endDate: new Date(education.studyEndDate),
      }));

      const createdEducation = await Education.create(educationData);
      return res.status(201).json(createdEducation);
    } else {
      // Create a single education record
      const {
        userId,
        degree,
        institution,
        fieldOfStudy,
        result,
        studyStartDate,
        studyEndDate,
      } = req.body;

      const createdEducation = await Education.create({
        userId,
        degree,
        institution,
        fieldOfStudy,
        result,
        startDate: new Date(studyStartDate),
        endDate: new Date(studyEndDate),
      });

      return res.status(201).json(createdEducation);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getAllEducation = async (req, res) => {
  try {
    if (req.query.query === "all") {
      // Fetch all education records
      const allEducation = await Education.find().sort({ id: 'asc' });
      return res.status(200).json(allEducation);
    } else if (req.query.status === "false") {
      // Fetch education records with status false
      const { skip, limit } = getPagination(req.query);
      const educationQuery = {
        status: false,
      };

      const allEducation = await Education.find(educationQuery)
        .sort({ id: 'asc' })
        .skip(Number(skip))
        .limit(Number(limit));

      return res.status(200).json(allEducation);
    } else {
      // Fetch education records with status true
      const { skip, limit } = getPagination(req.query);
      const educationQuery = {
        status: true,
      };

      const allEducation = await Education.find(educationQuery)
        .sort({ id: 'asc' })
        .skip(Number(skip))
        .limit(Number(limit));

      return res.status(200).json(allEducation);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getSingleEducation = async (req, res) => {
  try {
    // Fetch a single education record by its ID
    const singleEducation = await Education.findById(req.params.id);

    if (!singleEducation) {
      return res.status(404).json({ message: "Education record not found" });
    }

    // Check authorization (You can customize this part based on your authentication system)
    if (
      (req.auth.sub !== singleEducation.userId &&
        !req.auth.permissions.includes("readAll-education")) ||
      !req.auth.permissions.includes("readSingle-education")
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json(singleEducation);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleEducation = async (req, res) => {
  try {
    // Fetch the education record by its ID
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    if (req.query.query === "status") {
      // Update the status if the query parameter is "status"
      education.status = req.body.status;
    } else {
      // Update other fields
      education.degree = req.body.degree;
      education.institution = req.body.institution;
      education.fieldOfStudy = req.body.fieldOfStudy;
      education.result = req.body.result;
      education.startDate = new Date(req.body.studyStartDate);
      education.endDate = new Date(req.body.studyEndDate);
    }

    // Save the updated education record
    const updatedEducation = await education.save();

    return res.status(200).json(updatedEducation);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleEducation = async (req, res) => {
  try {
    // Fetch the education record by its ID
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    // Delete the education record
    await education.remove();

    return res.status(200).json({ message: "Education record deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createSingleEducation,
  getAllEducation,
  getSingleEducation,
  updateSingleEducation,
  deleteSingleEducation,
};
