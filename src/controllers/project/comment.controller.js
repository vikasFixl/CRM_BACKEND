import mongoose from "mongoose";
import { Comment } from "../../models/project/CommentModel.js";

// ✅ Create comment or reply
export const createComment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId } = req.params;
    const { content, parentId, projectId, workspaceId, organizationId } = req.body;
    const userId = req.user.userId;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Content is required." });
    }

    const [comment] = await Comment.create(
      [
        {
          content,
          taskId,
          parentId: parentId || null,
          projectId,
          workspaceId,
          organizationId,
          createdBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(comment);
  } catch (err) {
    await session.abortTransaction();
    console.error("Create comment failed:", err);
    res.status(500).json({ error: "Failed to create comment" });
  } finally {
    session.endSession();
  }
};

// ✅ Get threaded comments for a task
export const getCommentsByTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const allComments = await Comment.find({ taskId, isDeleted: false })
      .populate("createdBy", "name avatar")
      .lean();

    const map = {};
    const roots = [];

    allComments.forEach((comment) => {
      map[comment._id.toString()] = { ...comment, replies: [] };
    });

    allComments.forEach((comment) => {
      const id = comment._id.toString();
      const parentId = comment.parentId?.toString();
      if (parentId && map[parentId]) {
        map[parentId].replies.push(map[id]);
      } else {
        roots.push(map[id]);
      }
    });

    res.json(roots);
  } catch (err) {
    console.error("Fetch comments failed:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// ✅ Soft delete comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    await Comment.findByIdAndUpdate(commentId, { isDeleted: true });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment failed:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
