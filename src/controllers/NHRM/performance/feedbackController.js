import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import Feedback from "../../../models/NHRM/PerformanceManagement/feedback.js";

import mongoose from 'mongoose';

// Create feedback
export const createFeedback = async (req, res) => {
    try {
        const { employee, feedbackType, rating, comments } = req.body;
        const organization = req.orgUser.orgId
        const { userId } = req.user;

        if (!employee || !feedbackType) {
            return res.status(400).json({ message: 'Required fields missing.' });
        }

        const feedbackFrom = await EmployeeProfile.findOne({
            createdBy: userId,
            organizationId: organization,
            "jobInfo.status": "Active"
        });

        if (!feedbackFrom) {
            return res.status(400).json({ message: 'employee account not found in your organization' });
        }
        const feedback = await Feedback.create({
            organization,
            employee,
            feedbackType,
            feedbackFrom: feedbackFrom._id || null,
            rating,
            comments
        });

        return res.status(201).json({ message: 'Feedback created successfully', feedback });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const organization = req.orgUser.orgId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid feedback ID' });
        }

        const feedback = await Feedback.findOne({ _id: id, organization })
            .populate('employee', 'name email')
            .populate('feedbackFrom', 'name email')
            .populate('organization', 'name');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        return res.status(200).json({ data: feedback });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all feedbacks (with organization filter)
export const getAllFeedbacks = async (req, res) => {
    try {
        const organization = req.orgUser.orgId;

        // Query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const employee = req.query.employee;     // employeeId filter

        const skip = (page - 1) * limit;

        // Base filter: always organization scoped
        const filter = { organization };

        // If employee param exists, filter by employeeId
        if (employee) {
            filter.employee = employee;
        }

        // Total documents count (before pagination)
        const total = await Feedback.countDocuments(filter);

        const feedbacks = await Feedback.find(filter)
            .populate("employee", "personalInfo.fullName personalInfo.contact.email")
            .populate("feedbackFrom", "personalInfo.fullName personalInfo.contact.email")
            .sort({ createdAt: -1 })  // Newest first – industry standard
            .skip(skip)
            .limit(limit);
            
        return res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            count: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get feedback for a specific employee
export const getEmployeeFeedbacks = async (req, res) => {
    try {
        const { employeeId } = req.params;
const organization = req.orgUser.orgId
        if (!mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const feedbacks = await Feedback.find({ employee: employeeId , organization })
            .populate('feedbackFrom', 'name email')
            .populate('organization', 'name');

        return res.status(200).json({ count: feedbacks.length, data: feedbacks });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const organization = req.orgUser.orgId
        if (!mongoose.isValidObjectId(id || !id)) {
            return res.status(400).json({ message: 'Invalid feedback ID' });
        }

        const feedback = await Feedback.findByIdAndDelete({ _id: id, organization });

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        return res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};