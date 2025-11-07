import Asset from "../../../models/NHRM/ResourceManagement/Asset.js";
import AssetAssignmentHistory from "../../../models/NHRM/ResourceManagement/AssetHistory.js";
import AssetAssignment from "../../../models/NHRM/ResourceManagement/AssetAssignment.js";
/**
 * HR → Assign asset to employee
 */
export const assignAsset = async (req, res) => {
  try {
    const { assetId, assignedTo, expectedReturnDate, notes } = req.body;

    if(!assetId || !assignedTo) return res.status(400).json({ success: false, message: "Missing required fields" });
    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

    if (asset.status === "Assigned")
      return res.status(400).json({ success: false, message: "Asset is already assigned" });


    const assignment = await AssetAssignment.create({
      assetId,
      assignedTo,
      expectedReturnDate,
      notes,
    });

    asset.status = "Assigned";
    await asset.save();

    return res.status(201).json({
      message: "Asset assigned successfully",
      success: true,
       assignment,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * HR → Return asset (moves to history)
 */
export const returnAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { conditionOnReturn, notes } = req.body;

    const activeAssignment = await AssetAssignment.findOne({ assetId });
    if (!activeAssignment)
      return res.status(404).json({ success: false, message: "No active assignment found" });

    // log history
    await AssetAssignmentHistory.create({
      assetId,
      assignedTo: activeAssignment.assignedTo,
      assignmentDate: activeAssignment.assignmentDate,
      returnDate: new Date(),
      conditionOnReturn,
      notes,
    });

    // remove active assignment
    await activeAssignment.deleteOne();

    // update inventory
    await Asset.findByIdAndUpdate(assetId, { status: "Available" });

    return res.status(200).json({
      success: true,
      message: "Asset returned and history updated",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

