import express from "express";

import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getDocuments,
  uploadDocument,
  // updateDocument,
  deleteDocument,
  getStorageUsage
} from "../../controllers/project/document.controller.js";

const DocumentRouter = express.Router();


DocumentRouter.route("/")
  .get(isAuthenticated, authenticateOrgToken(), getDocuments)
  .post(isAuthenticated, authenticateOrgToken(), uploadDocument);

DocumentRouter.route("/:id")
  // .put(updateDocument)
  .delete(deleteDocument);

DocumentRouter.route("/storage/used").get(isAuthenticated, authenticateOrgToken(), getStorageUsage);

export default DocumentRouter;
