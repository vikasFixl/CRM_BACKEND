import express from "express"
import { assignTicket, CreateTicket, deleteTicket, getAllTickets, getMyTickets, getTicketById, updateTicketStatus } from "../controllers/ticket.controller.js";
import { isAuthenticated } from "../middleweare/middleware.js"
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js"
const Ticket = express.Router()

Ticket.route("/create").post(isAuthenticated, authenticateOrgToken(),CreateTicket);
Ticket.route("/all").get(isAuthenticated,getAllTickets);
Ticket.route("/:id").get(isAuthenticated,getTicketById);
Ticket.route("/update/:id").post(isAuthenticated,updateTicketStatus);
Ticket.route("/").get(isAuthenticated, authenticateOrgToken(),getMyTickets);
Ticket.route("/:id/assign").patch(isAuthenticated,assignTicket);
Ticket.route("/:id/delete").delete(isAuthenticated,deleteTicket);




export default Ticket