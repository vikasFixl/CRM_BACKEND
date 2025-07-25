import express from 'express';
import { getAllSessions, deleteUserSession, sendSessionDeletionOTP } from '../controllers/sessioncontroller.js';
import { isAuthenticated } from '../middleweare/middleware.js';

const router = express.Router();

// Get all sessions (admin only)
router.get('/all', isAuthenticated, getAllSessions);

// Send OTP for deleting a session (user)
router.post('/send-otp', isAuthenticated, sendSessionDeletionOTP);

// Delete a session after verifying OTP (user)
router.delete('/delete', isAuthenticated, deleteUserSession);

export default router;
