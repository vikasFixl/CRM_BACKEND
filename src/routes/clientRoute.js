const express = require("express");
const router = express.Router();
const clientController = require('../controllers/clients');

router.get("/", clientController.getClients);
router.get("/users", clientController.getClientsByUser);
router.post("/create", clientController.createClient);
router.get("/singleUser/:id", clientController.getClientById);
router.patch("/update/:id", clientController.updateClient);
router.delete("/delete/:id", clientController.deleteClient);

module.exports = router;
