import ticketModel from "../models/ticket.model.js";
import User from "../models/userModel.js";
import { createTicketSchema } from "../validations/ticketvalidation.js";

// utils/generateTicketNumber.ts
function generateTicketNumber() {
    const date = Date.now().toString(36); // base36 for compact date
    const rand = Math.floor(Math.random() * 36 ** 3).toString(36).padStart(3, '0'); // 3-char base36
    return `TKT-${date}-${rand}`.toUpperCase();
}


export const CreateTicket = async (req, res) => {
    try {
        const parsed = createTicketSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation error", errors: parsed.error.errors.map((e) => e.message) });
        }
        const {
            module,
            description,
            priority,
            status,
            title,
            type,
            tags

        } = parsed.data
        let ticketNumber = generateTicketNumber();
        const ticket = await ticketModel.create({
            module,
            description,
            priority,
            status,
            title,
            type,
            tags,
            organization: req.orgUser.orgId,
            requester: req.user.userId,
            createdBy: req.user.userId,
            ticketNumber
        });
        await ticket.save();
        return res.status(201).json({ message: "Ticket created successfully", });

    } catch (error) {
        logger.info(error);
        return res.status(500).json({ message: error.message });

    }
}
// Get all tickets
export const getAllTickets = async (req, res) => {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            organization,
            status,
            priority,
            ticketNumber,
            module,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        // Convert page and limit to integers
        const intPage = parseInt(page, 10);
        const intLimit = parseInt(limit, 10);

        // Create filter object based on query parameters
        const filter = {};
        if (organization) filter.organization = organization;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (ticketNumber) filter.ticketNumber = ticketNumber;
        if (module) filter.module = module;
        if (type) filter.type = type;

        // Create sort object based on query parameters
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate skip value for pagination
        const skip = (intPage - 1) * intLimit;

        // Fetch tickets with pagination and filtering
        const tickets = await ticketModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(intLimit);

        // Fetch total count for pagination metadata
        const totalTickets = await ticketModel.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalTickets / intLimit);

        // Prepare response
        const response = {
            tickets,
            page: intPage,
            limit: intLimit,
            totalTickets,
            totalPages,
        };

        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        logger.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await ticketModel.findById(id).populate('createdBy', 'email _id firstName lastName').populate("organization", "name email ");
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// Get tickets by requester
export const getMyTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find({ requester: req.user.userId }).populate('createdBy').populate("organization", "name email ");
        res.status(200).json(tickets);
    } catch (error) {
        logger.info("error in getMyTickets", error);
        return res.status(500).json({ message: "Internal server error" });

    }
};
export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { status } = req.body;
        const TicketStatusEnum = [
            'open',
            'in_progress',
            'on_hold',
            'resolved',
            'closed',
            'cancelled'
        ]

        if (!TicketStatusEnum.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }


        const ticket = await ticketModel.findById(id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found"});
        }

        ticket.status = status;
        await ticket.save();
        res.status(200).json({ message: "Ticket status updated successfully", ticket });
    } catch (error) {
        res.status(400).send(error);
    }
};

export const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;
        const userexists = await User.findById(assignedTo);
        if (!userexists) {
            return res.status(404).json({message:"assignee user not found"});
        }
        if (userexists.userType != "supportAgent") {
            return res.status(404).json({message:"assignee user is not a support agent"});
        }

        const ticket = await ticketModel.findById(id);

        if (!ticket) {
            return res.status(404).json({message:"Ticket not found"});
        }


        ticket.assignee = assignedTo;
        await ticket.save();
        res.status(200).json({ message: "Ticket assigned successfully", ticket });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
export const deleteTicket= async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await ticketModel.findByIdAndDelete(id);
        if (!ticket) {
            return res.status(404).json({message:"Ticket not found"});
        }
        res.status(200).json({ message: "Ticket deleted successfully", ticket });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}