// GET /project-templates
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { StatusCodes } from 'http-status-codes';
import { createSchema, updateSchema } from "../../validations/projecttemplate/validation.js";
import { uploadImageToCloudinary } from "../../utils/helperfuntions/uploadimage.js";
/* ---------- helpers ---------- */
const sendErr = (res, status, message) =>
    res.status(status).json({ success: false, message });

const notFound = (res, id) =>
    sendErr(res, StatusCodes.NOT_FOUND, `Template ${id} not found`);
export const listTemplates = async (req, res) => {
    try {
        const { category, recommended } = req.query;
        const organization = req.user.currentOrganization;
        console.log(req.user)

        const parseBool = (val) => val === "true";

        // Base filter generator
        const buildFilter = (isSystem) => {
            const filter = { isSystem };
            if (category) filter.category = category;
            if (recommended !== undefined) filter.recommended = parseBool(recommended);
            if (!isSystem) filter.organization = organization;
            return filter;
        };

        // Fetch system and org-specific templates
        const [systemTemplates, orgTemplates] = await Promise.all([
            ProjectTemplate.find(buildFilter(true)).select("_id name description boardType category recommended isSystem previewImage"),
            ProjectTemplate.find(buildFilter(false)).select("_id name description boardType category recommended isSystem previewImage"),
        ]);

        const allTemplates = [...systemTemplates, ...orgTemplates];

        return res.status(StatusCodes.OK).json({
            message: "template loaded ",
            success: true,
            total: allTemplates.length,
            Templates: allTemplates
        });
    } catch (err) {
        console.error("Error listing templates:", err);
        return sendErr(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to list templates");
    }
};


// GET /project-templates/:id
export const getTemplate = async (req, res) => {
    const template = await ProjectTemplate.findById(req.params.id);
    if (!template) return notFound(res, req.params.id);
    res.json({ success: true, data: template });
};

// POST /project-templates
export const createTemplate = async (req, res) => {
    try {
        // 1. fast validation -------------------------------------------------------
        const { data, error } = createSchema.safeParse(req.body);
        console.log(error)
        if (error) return sendErr(res, StatusCodes.BAD_REQUEST, error.errors[0]?.message);

        const { name, organization } = data;
        const isSuperAdmin = req.user.role === 'SuperAdmin';

        // 2. duplicate check (single query, indexed) ------------------------------
        const dup = await ProjectTemplate.exists({
            name,
            organization: isSuperAdmin ? null : organization,
        });
        if (dup) return sendErr(res, StatusCodes.CONFLICT, 'Template name already exists');

        // 3. image upload (only if present) ---------------------------------------
        let previewImage = { url: null, publicId: null };
        if (req.files?.image) {
            const file = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
            const { url, public_id } = await uploadImageToCloudinary({ file, folder: 'project_templates/images' });
            previewImage = { url, publicId: public_id };
        }

        // 4. create document -------------------------------------------------------
        const template = await ProjectTemplate.create({
            ...data,
            previewImage,
            isSystem: isSuperAdmin,
            createdBy: req.user.userId,
        });

        return res.status(StatusCodes.CREATED).json({ success: true, data: template });
    } catch (err) {
        console.error('Template creation failed:', err);
        return sendErr(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create template');
    }
};


// PATCH /project-templates/:id
export const updateTemplate = async (req, res) => {
    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
        return sendErr(res, StatusCodes.BAD_REQUEST, result.error.errors[0].message);
    }

    const { version, ...updateData } = result.data;
    const template = await ProjectTemplate.findById(req.params.id);
    if (!template) return notFound(res, req.params.id);

    if (version !== undefined && template.version !== version) {
        return sendErr(res, StatusCodes.CONFLICT, 'Template was modified by another user');
    }

    Object.assign(template, updateData);
    template.version += 1;
    await template.save();

    res.json({ success: true, data: template });
};

// DELETE /project-templates/:id
export const deleteTemplate = async (req, res) => {
    const template = await ProjectTemplate.findById(req.params.id);
    if (!template) return notFound(res, req.params.id);

    if (template.isSystem) {
        return sendErr(res, StatusCodes.FORBIDDEN, 'Cannot delete a system template');
    }

    await template.deleteOne();
    res.json({ success: true, message: 'Template deleted' });
};