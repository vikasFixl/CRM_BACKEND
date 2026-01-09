const roleModel = require("../models/roleNpermissionModel");

exports.createRole = async (req, res) => {
  const { role, permission, orgId } = req.body;
  try {
    const newRole = new roleModel({
      role: role,
      permission: permission,
      orgId: orgId,
    });
    await newRole.save();
    res.status(201).json({
      data: newRole,
      code: 201,
      success: true,
      message: "Role created successfully!",
    });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ message: "something went wrong! " });
  }
};

exports.getRole = async (req, res) => {
  try {
    const { orgId } = req.params;
    const data = await roleModel.find({ orgId: orgId }).sort({ _id: -1 });
    res.status(200).json({
      data: data,
      code: 200,
      success: true,
      message: "all data get here!!",
    });
  } catch (error) {
    res.status(409).json(err.message);
  }
};

exports.updateRole = async (req, res) => {
  try {
    const _id = req.params.id;
    const roleUpdate = await roleModel.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    res.send(roleUpdate);
  } catch (error) {
    res.status(409).send("Some error has occured while updating role!");
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const _id = req.params.id;
    await roleModel.findByIdAndRemove(_id);
    res.json({ message: "Role deleted successfully!" });
  } catch (error) {
    res.status(409).send("some error has occured while deleting role!");
  }
};
