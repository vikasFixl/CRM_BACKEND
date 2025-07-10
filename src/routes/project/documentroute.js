import express from "express";
import fileUpload from "express-fileupload";
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

// Enable file upload middleware
//DocumentRouter.use(fileUpload({ useTempFiles: true }));

// 📄 Get all documents | 🔼 Upload new document
DocumentRouter.route("/")
  .get(isAuthenticated,authenticateOrgToken(),getDocuments)
  .post(isAuthenticated,authenticateOrgToken(),uploadDocument);

// ✏️ Update document | 🗑️ Delete document by ID
DocumentRouter.route("/:id")
  // .put(updateDocument)
  .delete(deleteDocument);

// 📦 Get storage usage
DocumentRouter.route("/storage/used").get(isAuthenticated,authenticateOrgToken(),getStorageUsage);

export default DocumentRouter;
