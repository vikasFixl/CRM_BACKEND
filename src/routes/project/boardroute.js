import express from "express"
import { addColumn, deleteColumn, updateColumn } from "../../controllers/project/Board.controller.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";

const BoardRouter = express.Router();



BoardRouter.route("/:boardId/add-column").post(isAuthenticated, authenticateOrgToken(), addColumn);
BoardRouter.route("/:boardId/delete-column").delete(isAuthenticated, authenticateOrgToken(), deleteColumn);
BoardRouter.route("/:boardId/update-column").patch(isAuthenticated, authenticateOrgToken(), updateColumn);







export default BoardRouter