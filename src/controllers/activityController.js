import ActivityModel from "../models/activityModel.js";
export const getActivitiesByModule = async (req, res) => {
  const { module } = req.params;
  const orgId = req.orgUser.orgId;
  logger.info(req.user)

  // Parse query parameters for pagination
  const page = parseInt(req.query.page) || 1;       // default: page 1
  const limit = parseInt(req.query.limit) || 10;    // default: 10 items

  if (!orgId || !module) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Organization ID and module are required.",
    });
  }

  try {
    const query = { orgId, module ,userId:req.user.userId};

    const total = await ActivityModel.countDocuments(query);
    const activities = await ActivityModel.find(query).select("_id module  activity activityDesc createdAt userId orgId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      code: 200,
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      message: `Activities for module "${module}" fetched successfully.`,
    });
  } catch (error) {
    logger.error("Error fetching activities:", error.message);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to fetch activities.",
      error: error.message,
    });
  }
};

export const deleteActivityById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Activity ID is required.",
    });
  }

  try {
    const deleted = await ActivityModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Activity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Activity deleted successfully.",
    });
  } catch (error) {
    logger.error("Error deleting activity:", error.message);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to delete activity.",
      error: error.message,
    });
  }
};
// exports.getRecenteActivities = async (req, res) => {
//     const moduleName = req.params.module;
//     try {
//         const recentActivities = await ActivityModel.find({ module: { $in: [moduleName] } })
//             .sort({ _id: -1 })
//         // .limit(10);

//         res.status(200).json({
//             data: recentActivities,
//             status: 200,
//             message: "All recent activities get here"
//         });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// exports.getEntityRecenteActivities = async (req, res) => {
//     const moduleName = req.params.module;
//     const entityId = req.params.entityId;

//     try {
//         const recentActivities = await ActivityModel.find({ module: { $in: [moduleName] }, entityId: { $in: [entityId] } })
//             .sort({ _id: -1 })
//         // .limit(10);

//         res.status(200).json({
//             data: recentActivities,
//             status: 200,
//             message: "All recent activities get here"
//         });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// exports.getUserActivity = async (req, res) => {
//     const userId = req.params.id;

//     try {
//         const recentActivities = await ActivityModel.find({ userId }).sort({ _id: -1 });
//         res.status(200).json({
//             data: recentActivities,
//             status: 200,
//             message: "All"
//         });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


// exports.createActivities = async (req, res) => {
//     try {
//         const form = req.body;
//         const newActivity = new ActivityModel(form);
//         await newActivity.save();
//         res.status(201).json({
//             data: newActivity,
//             status: 201,
//             success: true,
//             message: "Activity created successfully"
//         });
//     } catch {
//         res.status(400).json({
//             status: 400,
//             success: false,
//         });
//     };
// };