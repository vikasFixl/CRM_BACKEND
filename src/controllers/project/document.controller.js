import { Document } from "../../models/project/DocumentModel.js";
import { uploadFileToCloudinary, deleteCloudinaryAsset, uploadImageToCloudinary } from "../../utils/helperfuntions/uploadimage.js"
import mongoose from "mongoose";



export const uploadDocument = async (req, res) => {
    try {
        const { projectId, taskId, workspaceId } = req.body;
        const organizationId = req.orgUser.orgId;
        const uploadedBy = req.user.userId;

        logger.info("Incoming files:", req.files); // Debug log

        // Validate files exist and are properly structured
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files were uploaded" });
        }

        // Initialize document data
        const documentData = {
            organizationId,
            uploadedBy,
            workspaceId: workspaceId || null,
            projectId: projectId || null,
            taskId: taskId || null,
            level: taskId ? "task" :
                projectId ? "project" :
                    workspaceId ? "workspace" : "organization"
        };

        // Process File Upload (if exists)
        if (req.files.file) {
            const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;

            if (!file.tempFilePath && !file.data) {
                throw new Error("File is malformed - missing both tempFilePath and data");
            }

            const cloudData = await uploadFileToCloudinary({
                file,
                folder: "documents/files"
            });

            documentData.file = {
                name: file.name,
                url: cloudData.url,
                public_id: cloudData.public_id,
                type: file.mimetype,
                size: file.size
            };
        }

        // Process Image Upload (if exists)
        if (req.files.image) {
            const image = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;

            if (!image.tempFilePath && !image.data) {
                throw new Error("Image is malformed - missing both tempFilePath and data");
            }

            const cloudImg = await uploadImageToCloudinary({
                file: image,
                folder: "documents/images"
            });
            logger.info("cloudImg", cloudImg);

            documentData.file = documentData.file || {}; // Ensure file exists
            documentData.image = {
                url: cloudImg.url,
                public_id: cloudImg.public_id,
                size: cloudImg.bytes
            };
        }
        logger.info("documentData", documentData);

        // Final validation
        if (!documentData.file && !documentData.image) {
            return res.status(400).json({
                message: "No valid file or image was processed",
                receivedFiles: Object.keys(req.files)
            });
        }

        const document = await Document.create(documentData);
        res.status(201).json({
            message: "Document uploaded successfully",
            document
        });

    } catch (err) {
        logger.error("Upload error:", {
            message: err.message,
            stack: err.stack,
            receivedFiles: req.files ? Object.keys(req.files) : null
        });

        res.status(500).json({
            message: "Upload failed",
            error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
        });
    }
};


//  Get all documents (filter by taskId/projectId/org/workspace)
export const getDocuments = async (req, res) => {
    try {
        const { projectId, taskId, workspaceId } = req.query;
        const organizationId = req.orgUser.orgId;

        const filter = {
            isDeleted: false,
        };
        if (projectId) filter.projectId = projectId;
        if (taskId) filter.taskId = taskId;
        if (organizationId) filter.organizationId = organizationId;
        if (workspaceId) filter.workspaceId = workspaceId;

        const documents = await Document.find(filter)
            .sort({ createdAt: -1 })
            .populate("uploadedBy", "firstName lastName email");

        res.status(200).json({ message: "document loaded successfully", success: true, total: documents.length, documents });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch documents", error: err.message });
    }
};

//  Delete a document (soft delete + cloudinary)
export const deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: "Invalid document ID" });
        }

        const document = await Document.findOne({ _id: documentId });

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (document.file.public_id !== null) {
            await deleteCloudinaryAsset(document.file.public_id);
        } else if (document.image.public_id !== null) {
            await deleteCloudinaryAsset(document.image.public_id);
        }
        await Document.findByIdAndDelete(documentId);
        res.status(200).json({ message: "Document deleted successfully", documentId });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete document", error: err.message });
    }
};



export const getStorageUsage = async (req, res) => {
    try {
        const organizationId = req.orgUser?.orgId;

        const filter = {
            isDeleted: false,
            ...(organizationId && { organizationId })
        };

        // First get total document count
        const totalDocs = await Document.countDocuments(filter);
        const toalbytes = await Document.find({}).select('file.size image.size')
        const totalSize = toalbytes.reduce((acc, doc) => {
            const fileSize = doc?.file?.size || 0;
            const imageSize = doc?.image?.size || 0;
            return acc + fileSize + imageSize;
        }, 0);

        res.status(200).json({
            success: true,
            message: "Storage usage calculated successfully",
            totalFiles: totalDocs,
            totalSizeInBytes: totalSize,
            totalSizeInMB: (totalSize / (1024 * 1024)).toFixed(2) + " MB",
            totalSizeInGB: (totalSize / (1024 * 1024 * 1024)).toFixed(3) + " GB",
        });

    } catch (err) {
        logger.error("Storage usage error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to calculate storage usage",
            error: process.env.NODE_ENV === 'development' ? err.message : "Internal error",
        });
    }
};

