import PerformanceAppraisal from "../../../models/NHRM/PerformanceManagement/performanceAppraisals.js";

export const createAppraisal = async (req, res) => {
    try {
        const {
            employee,
            period,
            rating,
            criteria,
            comments,
            managerComments,
            recommendation
        } = req.body;

        // ✅ REQUIRED FIELD VALIDATION
        if (!employee) {
            return res.status(400).json({ success: false, message: "Employee is required" });
        }

        if (!period) {
            return res.status(400).json({ success: false, message: "Period is required" });
        }

        if (!rating && rating !== 0) {
            return res.status(400).json({ success: false, message: "Rating is required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // ✅ criteria validation
        if (criteria && !Array.isArray(criteria)) {
            return res.status(400).json({ success: false, message: "Criteria must be an array" });
        }

        // ✅ Create
        const appraisal = await PerformanceAppraisal.create({
            organization: req.orgUser.orgId,
            employee,
            period,
            rating,
            criteria,
            comments,
            managerComments,
            reviewedBy: req.user.userId,
            recommendation
        });

        return res.status(201).json({
            message: "Appraisal created successfully",
            appraisal,
            success: true,
        });

    } catch (err) {
        logger.error("Error creating appraisal:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAppraisals = async (req, res) => {
  try {
    const { status, employee, period } = req.query;
    const query = { organization: req.orgUser.orgId };

    if (status) query.status = status;
    if (employee) query.employee = employee;
    if (period) query.period = period;

    const list = await PerformanceAppraisal.find(query)
      .populate("employee", "personalInfo.email firstName lastName employeeId")
      .populate("reviewedBy", "email firstName lastName")
      .sort({ createdAt: -1 });

    // ✅ FIXED formatter
    const formatAppraisal = (item) => ({
      id: item._id,
      organization: item.organization,
      employee: {
        id: item.employee?._id,
        email: item.employee?.personalInfo?.email,
        employeeId: item.employee?.employeeId
      },
      period: item.period,
      rating: item.rating,
      reviewedBy: item.reviewedBy?.email,
      criteria: item.criteria?.map((c) => ({
        label: c.label,
        score: c.score,
        comments: c.comments
      }))
    });

    // ✅ map results
    const formatted = list.map(formatAppraisal);

    return res.status(200).json({
      message: "Appraisals fetched successfully",
      success: true,
      data: formatted
    });

  } catch (err) {
    logger.error("Error fetching appraisals:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAppraisalById = async (req, res) => {
    try {
        const appraisal = await PerformanceAppraisal.findOne({
            _id: req.params.id,
            organization: req.user.organization
        })
            .populate("employee", "personalInfo.email firstName lastName")
            .populate("reviewedBy", "email firstName lastName");

        if (!appraisal) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        res.status(200).json({ success: true, data: appraisal });
    } catch (err) {
        logger.error("Error getting appraisal:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
export const updateAppraisal = async (req, res) => {
    try {
        const allowed = [
            "criteria",
            "overallRating",
            "comments",
            "managerComments",
            "developmentActions",
            "recommendation",
            "status"
        ];

        const updateData = {};
        Object.keys(req.body).forEach((key) => {
            if (allowed.includes(key)) updateData[key] = req.body[key];
        });

        const updated = await PerformanceAppraisal.findOneAndUpdate(
            {
                _id: req.params.id,
                organization: req.user.organization
            },
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        logger.error("Error updating appraisal:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteAppraisal = async (req, res) => {
    try {
        const removed = await PerformanceAppraisal.findOneAndDelete({
            _id: req.params.id,
            organization: req.user.organization
        });

        if (!removed) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        res.status(200).json({ success: true, message: "Deleted" });
    } catch (err) {
        logger.error("Error deleting appraisal:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
