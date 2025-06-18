import express from "express";
const ClientRouter = express.Router();
import { createClient, deleteClient, getClientById, getClients, getClientsByUser } from "../controllers/clients.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";


// router.get("/:orgId", clientController.getClients);

ClientRouter.route("/all").get(isAuthenticated, authenticateOrgToken(), getClients);


ClientRouter.route("/users").get(isAuthenticated, authenticateOrgToken(), getClientsByUser);
ClientRouter.route("/singleUser/:id").get(isAuthenticated, authenticateOrgToken(), getClientById);
// router.get("/users", clientController.getClientsByUser);
// router.get("/singleUser/:id", authorize('Read', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.getClientById);

ClientRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createClient);

// router.patch("/update/:id", authorize('Update', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.updateClient);

ClientRouter.route("/delete/:id").delete(isAuthenticated, authenticateOrgToken(), deleteClient);
// router.delete("/delete/:id", authorize('Delete', 'client', ['Admin', 'Custom']), clientController.deleteClient);

export default ClientRouter
