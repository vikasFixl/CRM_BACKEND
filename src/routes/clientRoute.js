const express = require("express");
const router = express.Router();
const clientController = require('../controllers/clients');

router.get("/:orgId", clientController.getClients);
router.get("/users", clientController.getClientsByUser);
router.get("/singleUser/:id", clientController.getClientById);

router.post("/create", clientController.createClient);

router.patch("/update/:id", clientController.updateClient);

router.delete("/delete/:id", clientController.deleteClient);

module.exports = router;
