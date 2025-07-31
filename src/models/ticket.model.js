
import mongoose from 'mongoose';
const { Schema } = mongoose;
export const MODULES = {
    LEAD: "lead",
    CLIENT: "client",
    FIRM: "firm",
    USER: "user",
    INVOICE: "invoice",
    PROJECT: "project",
    OTHER: "other"
};
const ticketSchema = new Schema(
    {
        ticketNumber: {
            type: String,
            unique: true,
            index: true,
            required: true,
        }, module: {
            type: String,
            enum: Object.values(MODULES),
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'],
            default: 'open',
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        type: {
            type: String,
            enum: ['bug', 'feature_request', 'question', 'task', 'incident'],
            default: 'task',
            required:true
        },
        tags: [String],

        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },

        dueDate: {
            type: Date,
        },
        resolvedAt: {
            type: Date,
        },
        closedAt: {
            type: Date,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Ticket', ticketSchema);