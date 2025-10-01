// import Org from ""

// Suspend User
export const suspendUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, { isSuspended: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User suspended", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unsuspend User
export const unsuspendUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, { isSuspended: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unsuspended", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Suspend Organization
export const suspendOrganization = async (req, res) => {
  const { orgId } = req.params;
  try {
    const org = await Org.findByIdAndUpdate(orgId, { isSuspended: true }, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // Optionally suspend all users in the org
    await User.updateMany({ organization: orgId }, { isSuspended: true });

    res.json({ message: "Organization suspended", org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unsuspend Organization
export const unsuspendOrganization = async (req, res) => {
  const { orgId } = req.params;
  try {
    const org = await Org.findByIdAndUpdate(orgId, { isSuspended: false }, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // Optionally unsuspend all users in the org
    await User.updateMany({ organization: orgId }, { isSuspended: false });

    res.json({ message: "Organization unsuspended", org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

