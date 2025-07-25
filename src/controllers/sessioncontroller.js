
// Get all sessions (admin only)
import { Session } from "../models/sessionModel.js";
import User from "../models/userModel.js";
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('user', 'email');
    res.status(200).json({
        message: "All sessions fetched successfully",
        success: true,
        code: 200,
        sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Delete a user's session after verifying OTP
export const deleteUserSession = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;
    const user = await User.findById(req.user.userId).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const session = await Session.findByIdAndDelete(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

   
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error("Error deleting user session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send OTP for session deletion
export const sendSessionDeletionOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    // await sendEmail(user.email, 'Session Deletion OTP', `Your OTP for session deletion is ${otp}`);

    res.json({ message: 'OTP sent to email successfully' , otp});
  } catch (error) {
    console.error("Error sending session deletion OTP:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};