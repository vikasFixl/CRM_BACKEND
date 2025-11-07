import Asset from "../../../models/NHRM/ResourceManagement/Asset.js";
import AssetAssignment from "../../../models/NHRM/ResourceManagement/AssetAssignment.js";
import AssetAssignmentHistory from "../../../models/NHRM/ResourceManagement/AssetHistory.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js"
/**
 * HR / Admin → Create asset inventory record
 */
export const createAsset = async (req, res) => {
  try {
    const { orgId } = req.orgUser; // STOP destructuring like a clown

    const {
      assetName,
      assetType,
      serialNumber,
      condition,
      status,
      purchaseDate,
      cost,
      notes,
    } = req.body;

    if (!assetName || !assetType || !serialNumber) {
      return res.status(400).json({ success: false, message: "missing device info" });
    }

    const asset = await Asset.create({
      organizationId: orgId,
      assetName,
      assetType,
      serialNumber,
      condition,
      status,
      purchaseDate,
      cost,
      notes,
    });

    return res.status(201).json({
      message: "Asset created successfully",
      success: true,
      data: asset,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.errors || err.message,
    });
  }
};

/**
 * HR → Get all assets in organization
 */
export const getAllAssets = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;

    const {
      page = 1,
      limit = 10,
      condition,
      assetType,
      serialNumber,
      assetName,
      status
    } = req.query;

    const skip = (page - 1) * limit;

    // Build dynamic query
    const query = { organizationId };

    if (condition) query.condition = condition;
    if (assetType) query.assetType = assetType;
    if (status) query.status = status;
    if (serialNumber) query.serialNumber = { $regex: serialNumber, $options: "i" };
    if (assetName) query.assetName = { $regex: assetName, $options: "i" };

    const assets = await Asset.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Asset.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Assets retrieved successfully",
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      assets
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


/**
 * HR → Update asset info (condition, status, etc.)
 */
export const updateAsset = async (req, res) => {
  try {
    const { orgId: organizationId } = req.orgUser;
    const { assetId } = req.params;

    const {
      assetName,
      assetType,
      serialNumber,
      condition,
      status,
      purchaseDate,
      cost,
      notes,
    } = req.body;

    if (!assetName || !assetType || !serialNumber) {
      return res.status(400).json({
        success: false,
        message: "missing device info",
      });
    }

    // ✅ Use a different variable name (don't shadow the model)
    const existingAsset = await Asset.findOne({ _id: assetId, organizationId });

    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // ✅ Your way: update only provided fields, fallback to existing values
    await existingAsset.updateOne({
      organizationId,
      assetName: assetName || existingAsset.assetName,
      assetType: assetType || existingAsset.assetType,
      serialNumber: serialNumber || existingAsset.serialNumber,
      condition: condition || existingAsset.condition,
      status: status || existingAsset.status,
      purchaseDate: purchaseDate || existingAsset.purchaseDate,
      cost: cost || existingAsset.cost,
      notes: notes || existingAsset.notes,
    });

    // fetch latest value after update
    const updated = await Asset.findById(assetId);

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.errors || err.message,
    });
  }
};



export const deleteAsset = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const asset = await Asset.find({ organizationId, _id: req.params.assetId });
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

    if (asset.status === "Assigned")
      return res.status(400).json({ success: false, message: "Cannot delete assigned asset" });
    // ✅ Use model delete, no need to call deleteOne on doc
    await Asset.deleteOne({ _id: asset._id, organizationId });

    return res.status(200).json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMyAssignedAssets = async (req, res) => {
  try {
    const { employeeId } = req.body
    const orgId = req.orgUser.orgId


    const employee = await EmployeeProfile.findOne({ employeeId, organizationId: orgId })

    if (!employee) return res.status(404).json({ message: "Employee not found under this organization" });

    const assigned = await AssetAssignment.find({ assignedTo: employee._id })
      .populate("assetId", "assetName assetType serialNumber condition status");

    return res.status(200).json({
      message: "Assets retrieved successfully",
      success: true,
      assets: assigned || [],
      count: assigned.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
export const GetAssetById = async (req, res) => {
  try {
    const { assetId } = req.params;
    const orgId = req.orgUser.orgId;
    const asset = await Asset.findOne({ _id: assetId, organizationId: orgId });
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found " });
    }
    const assesthistory=await AssetAssignmentHistory.findOne({assetId:asset._id}).populate("assignedTo", "employeeId").select("-assetId");
    return res.status(200).json({ success: true, message: "Asset retrieved successfully",  asset , assesthistory});
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};