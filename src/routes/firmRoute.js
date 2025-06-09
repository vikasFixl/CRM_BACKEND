import express from "express";
import * as firmController from "../controllers/firm.js";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import AWS from "@aws-sdk/client-s3";

const Router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: "AKIAXLHG4KUVTUGY2JWI",
  secretAccessKey: "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",
});

const storage = multerS3({
  s3: s3,
  bucket: "crmfirmupload",
  key: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Math.random() + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
//withmiddlware

/**
 * // Create firm
Router.route("/create").post(
  authorize("Create", "firm", ["Admin", "subAdmin", "Custom"]),
  firmController.createFirm
);

// Delete firm by id
Router.route("/delete/:id").delete(
  authorize("Delete", "firm", ["Admin", "Custom"]),
  firmController.deleteFirm
);

// Get single firm by orgId and id
Router.route("/getFirm/:orgId/:id").get(
  authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]),
  firmController.getFirm
);

// Get single firm by orgId and id (invoice recurring)
Router.route("/getFirmforinvoicerecurring/:orgId/:id").get(
  firmController.getFirm
);

// Get all firms for orgId
Router.route("/getAllFirm/:orgId").get(
  authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]),
  firmController.getAllFirm
);

// Get firm list for orgId
Router.route("/getFirmList/:orgId").get(
  authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]),
  firmController.getFirmList
);

// Update firm by id
Router.route("/update/:id").patch(
  authorize("Update", "firm", ["Admin", "subAdmin", "Custom"]),
  firmController.updateFirm
);

// Upload logo for firm by id
Router.route("/insertlogo/:id").patch(
  authorize("Update", "firm", ["Admin", "subAdmin", "Custom"]),
  upload.single("logo"),
  firmController.logo
);
 */

// Create firm
Router.route("/create").post(firmController.createFirm);

// Delete firm by id
Router.route("/delete/:id").delete(firmController.deleteFirm);

// Get single firm by orgId and id
Router.route("/getFirm/:orgId/:id").get(firmController.getFirm);

// Get single firm by orgId and id (invoice recurring)
Router.route("/getFirmforinvoicerecurring/:orgId/:id").get(firmController.getFirm);

// Get all firms for orgId
Router.route("/getAllFirm/:orgId").get(firmController.getAllFirm);

// Get firm list for orgId
Router.route("/getFirmList/:orgId").get(firmController.getFirmList);

// Update firm by id
Router.route("/update/:id").patch(firmController.updateFirm);

// Upload logo for firm by id
Router.route("/insertlogo/:id").patch(upload.single("logo"), firmController.logo);

export default Router;
