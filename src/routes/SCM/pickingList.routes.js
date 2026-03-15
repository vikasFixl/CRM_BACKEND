import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createPickingList,
  getPickingLists,
  getPickingListById,
  assignPicker,
  pickItems,
  completePicking,
} from "../../controllers/SCM/pickingList.controller.js";

const router = express.Router();

router.post("/picking-lists", isAuthenticated, authenticateOrgToken(), createPickingList);
router.get("/picking-lists", isAuthenticated, authenticateOrgToken(), getPickingLists);
router.get("/picking-lists/:id", isAuthenticated, authenticateOrgToken(), getPickingListById);
router.post("/picking-lists/:id/assign", isAuthenticated, authenticateOrgToken(), assignPicker);
router.post("/picking-lists/:id/pick", isAuthenticated, authenticateOrgToken(), pickItems);
router.post("/picking-lists/:id/complete", isAuthenticated, authenticateOrgToken(), completePicking);

export default router;

