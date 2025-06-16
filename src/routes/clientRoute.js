import express from "express";
const ClientRouter = express.Router();
import { createClient } from "../controllers/clients.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";


// router.get("/:orgId", clientController.getClients);

// router.get("/:orgId", authorize('Read', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.getClients);
// router.get("/users", clientController.getClientsByUser);
// router.get("/singleUser/:id", authorize('Read', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.getClientById);

ClientRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createClient);

// router.patch("/update/:id", authorize('Update', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.updateClient);

// router.delete("/delete/:id", authorize('Delete', 'client', ['Admin', 'Custom']), clientController.deleteClient);

export default ClientRouter
