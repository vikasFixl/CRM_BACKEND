const express = require("express");
const router = express.Router();
const clientController = require('../controllers/clients');
const { authorize } = require("../middleweare/middleware");

// router.get("/:orgId", clientController.getClients);

router.get("/:orgId", authorize('Read', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.getClients);
router.get("/users", clientController.getClientsByUser);
router.get("/singleUser/:id", authorize('Read', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.getClientById);

router.post("/create", authorize('Create', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.createClient);

router.patch("/update/:id", authorize('Update', 'client', ['Admin', 'subAdmin', 'Custom']), clientController.updateClient);

router.delete("/delete/:id", authorize('Delete', 'client', ['Admin', 'Custom']), clientController.deleteClient);

module.exports = router;
