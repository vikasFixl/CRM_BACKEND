export const createWorkspace = async (req, res) => {
    try {
        res.status(200).json({ message: "Workspace created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to create workspace" });
    }
}