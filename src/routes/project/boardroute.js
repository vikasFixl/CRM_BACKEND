import express from "express"
import { addColumn, deleteBoard, deleteColumn, getAllBoard, getBoardById, updateColumn } from "../../controllers/project/Board.controller.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";

const BoardRouter = express.Router();

// get all board by project
BoardRouter.route("/:projectId/all").get(isAuthenticated, authenticateOrgToken(),getAllBoard);
BoardRouter.route("/:boardId").get(isAuthenticated, authenticateOrgToken(),getBoardById);
BoardRouter.route("/:boardId/delete").delete(isAuthenticated, authenticateOrgToken(),deleteBoard);
BoardRouter.route("/:boardId/add-column").post(isAuthenticated, authenticateOrgToken(), addColumn);
BoardRouter.route("/:boardId/delete-column").delete(isAuthenticated, authenticateOrgToken(), deleteColumn);
BoardRouter.route("/:boardId/update-column").patch(isAuthenticated, authenticateOrgToken(), updateColumn);







export default BoardRouter