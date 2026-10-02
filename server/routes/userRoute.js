import express from 'express';
import rateLimit from 'express-rate-limit';
import upload from '../middleware/multer.js';
import { 
  updateAdmin, 
  adminLogin, 
  forgotPassword, 
  verifyOtp, 
  resetPassword, 
  getAdminProfile, 
  adminLogout, 
  removeProfilePicture 
} from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Admin login brute-force protection
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many admin login attempts. Please try again after 15 minutes.' },
});

const adminOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please wait before trying again.' },
});

const adminOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP verification attempts. Please try again after 15 minutes.' },
});

router.post('/admin', adminLoginLimiter, adminLogin);
router.get('/me', adminAuth, getAdminProfile);
router.put('/update/:id', adminAuth, upload.fields([{ name: 'profilePicture', maxCount: 1 }]), updateAdmin);
router.post('/forgot-password', adminOtpLimiter, forgotPassword);
router.post('/verify-otp', adminOtpVerifyLimiter, verifyOtp);
router.post('/reset-password', adminLoginLimiter, resetPassword);
router.delete('/remove-profile-picture/:id', adminAuth, removeProfilePicture);
router.post('/logout', adminAuth, adminLogout);

export default router;