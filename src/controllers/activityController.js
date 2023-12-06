const ActivityModel = require("../models/activityModel");

exports.getRecenteActivities = async (req, res) => {
    const moduleName = req.params.module;
    try {
        const recentActivities = await ActivityModel.find({ module: { $in: [moduleName] } })
            .sort({ _id: -1 })
            // .limit(10);

        res.status(200).json({
            data: recentActivities,
            status: 200,
            message: "All recent activities get here"
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getEntityRecenteActivities = async (req, res) => {
    const moduleName = req.params.module;
    const entityId = req.params.entityId;

    try {
        const recentActivities = await ActivityModel.find({ module: { $in: [moduleName] }, entityId: { $in: [entityId] } })
            .sort({ _id: -1 })
            // .limit(10);

        res.status(200).json({
            data: recentActivities,
            status: 200,
            message: "All recent activities get here"
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createActivities = async (req, res) => {
    try {
        const form = req.body;
        const newActivity = new ActivityModel(form);
        await newActivity.save();
        res.status(201).json({
            data: newActivity,
            status: 201,
            success: true,
            message: "Activity created successfully"
        });
    } catch {
        res.status(400).json({
            status: 400,
            success: false,
        });
    };
};