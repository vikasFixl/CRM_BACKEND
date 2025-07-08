import express from "express";
const ClientRouter = express.Router();
import {
  createClient,
  getALLdeletedClient,
  getClientById,
  getClients,
  getClientsByUser,
  MoveClientToTrash,
  RestoreClient,
  updateClient,
} from "../controllers/clients.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import {
  authenticateOrgToken,
  checkPermission,
} from "../middleweare/orgmiddleware.js";

// router.get("/:orgId", clientController.getClients);

ClientRouter.route("/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "VIEW_ONLY"),
  getClients
);

ClientRouter.route("/users").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "VIEW_ONLY"),
  getClientsByUser
);
ClientRouter.route("/singleUser/:id").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "VIEW_ONLY"),
  getClientById
);
ClientRouter.route("/deleted/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "VIEW_TRASH"),
  getALLdeletedClient
);
// router.get("/users", clientController.getClientsByUser);
// router.get("/singleUser/:id", authorize('Read', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.getClientById);

ClientRouter.route("/create").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "CREATE_CLIENT"),
  createClient
);
ClientRouter.route("/restore/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "RESTORE_CLIENT"),
  RestoreClient
);
ClientRouter.route("/update/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "EDIT_CLIENT"),
  updateClient
);

// router.patch("/update/:id", authorize('Update', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.updateClient);
// router.delete("/delete/:id", authorize('Delete', 'client', ['Admin', 'Custom']), clientController.deleteClient);

ClientRouter.route("/delete/:id").delete(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("client", "DELETE_CLIENT"),
  MoveClientToTrash
);

export default ClientRouter;
