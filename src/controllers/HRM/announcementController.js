const { getPagination } = require("../../utils/query");
const Announcement = require("../../models/HRM/announcement");

//create a new employee
const createSingleAnnouncement = async (req, res) => {
  try {
    if (req.query.query === "deletemany") {
      // Delete many announcements at once
      const deletedAnnouncement = await Announcement.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedAnnouncement);
    } else {
      // Create a single announcement from an object
      const { title, description } = req.body;
      const createdAnnouncement = new Announcement({
        title,
        description,
      });

      await createdAnnouncement.save();

      return res.status(201).json({ createdAnnouncement });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllAnnouncement = async (req, res) => {
  const { query, status } = req.query;

  try {
    let queryFilter = {};

    if (query === "all") {
      // Get all announcements, ordered by descending id
      queryFilter = {};
    } else if (status === "false") {
      // Get announcements with status false
      queryFilter = { status: false };
    } else {
      // Get announcements with status true (default)
      queryFilter = { status: true };
    }

    const { skip, limit } = getPagination(req.query);

    const allAnnouncement = await Announcement.find(queryFilter)
      .sort({ _id: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    return res.status(201).json({
      total: allAnnouncement.length,
      Total_Pages: Math.ceil(allAnnouncement.length / limit),
      Announcement: allAnnouncement,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


const getSingleAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;

    const singleAnnouncement = await Announcement.findById(announcementId);

    if (!singleAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(201).json({
      success:true,
      message: `${singleAnnouncement.title} Announcement found Successfully.`,
      data:singleAnnouncement,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { title, description } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      { title, description },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deletedAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { status } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      { status },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleAnnouncement,
  getAllAnnouncement,
  getSingleAnnouncement,
  updateSingleAnnouncement,
  deletedAnnouncement,
};
