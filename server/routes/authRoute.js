import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  verifyEmail,
  sendVerifyOtp,
  isAuthenticated,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  updateProfile,
  deleteAccount,
  removeProfilePicture,
  syncAfterLogin,
  syncAfterGoogleLogin,
} from '../controllers/authController.js';
import {
  googleAuth,
  googleCallback,
  googleAuthSuccess
} from '../controllers/googleAuthController.js';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/multer.js';

const authRouter = express.Router();

// Rate limiters for security against brute-force & denial of service
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 OTP requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please wait a few minutes before trying again.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 verification attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP verification attempts. Please try again after 15 minutes.' },
});

// Google OAuth routes
authRouter.get('/google', googleAuth);
authRouter.get('/google/callback', googleCallback);
authRouter.get('/google/success', userAuth, googleAuthSuccess);
authRouter.post('/google-sync', userAuth, syncAfterGoogleLogin);

// Authentication routes (with rate limiting on sensitive actions)
authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', otpLimiter, sendVerifyOtp);
authRouter.post('/verify-account', otpVerifyLimiter, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', otpLimiter, sendResetOtp);
authRouter.post('/verify-reset-otp', otpVerifyLimiter, verifyResetOtp);
authRouter.post('/reset-password', authLimiter, resetPassword);
authRouter.put('/update-profile', userAuth, upload.single('file'), updateProfile);
authRouter.delete('/delete-account', userAuth, deleteAccount);
authRouter.delete('/remove-profile-picture', userAuth, removeProfilePicture);
authRouter.post('/sync', userAuth, syncAfterLogin);

export default authRouter;