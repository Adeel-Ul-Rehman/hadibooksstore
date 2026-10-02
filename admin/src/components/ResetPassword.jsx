import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { backendURL } from '../App';
import assets from '../assets/assets';

const ResetPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'password'
  const [adminEmail, setAdminEmail] = useState('');
  const [sharedEmail, setSharedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${backendURL}/api/user/forgot-password`, {
        adminEmail,
        sharedEmail,
      }, { withCredentials: true });

      if (response.data.success) {
        setSuccess('OTP have been sent');
        setTimeout(() => setStep('otp'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Forgot password error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length <= 6) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length < 6) {
        inputRefs.current[pastedData.length].focus();
      } else {
        inputRefs.current[5].focus();
      }
    }
  };

  // OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/api/user/verify-otp`, {
        email: adminEmail,
        otp: otpCode,
      }, { withCredentials: true });

      if (response.data.success) {
        setSuccess('OTP verified successfully');
        setTimeout(() => setStep('password'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('OTP verification error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/api/user/reset-password`, {
        email: adminEmail,
        otp: otp.join(''),
        newPassword,
      }, { withCredentials: true });

      if (response.data.success) {
        setSuccess('Password reset successfully');
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Reset password error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Focus first OTP input on step change
  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0].focus();
    }
  }, [step]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-xs sm:max-w-sm p-4 sm:p-6 bg-gradient-to-b from-black to-gray-900 rounded-xl shadow-2xl border border-orange-600">
        <div className="text-center mb-4">
          <div className="mx-auto bg-sky-100 p-2 rounded-lg shadow-md border border-sky-300 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3">
            <img src={assets.logo} alt="Logo" className="h-full w-auto" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-sky-100">
            {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
          </h2>
          <p className="mt-1 text-xs text-orange-300">
            {step === 'email'
              ? 'Enter your admin and recovery email'
              : step === 'otp'
              ? 'Enter the 6-digit OTP'
              : 'Enter your new password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-800 border-red-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs mb-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-800 border-green-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs mb-3">
            {success}
          </div>
        )}

        {step === 'email' && (
          <form className="space-y-3" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="adminEmail" className="block text-xs font-medium text-sky-100 mb-1">
                Admin Email
              </label>
              <input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
                placeholder="Enter your admin email"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="sharedEmail" className="block text-xs font-medium text-sky-100 mb-1">
                Recovery Email
              </label>
              <input
                id="sharedEmail"
                type="email"
                value={sharedEmail}
                onChange={(e) => setSharedEmail(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
                placeholder="Enter recovery email"
                required
                disabled={loading}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-3 sm:px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Send OTP'}
              </button>
            </div>
            <div className="text-center mt-3">
              <Link
                to="/admin"
                className="text-xs text-orange-300 hover:text-orange-400 transition-colors duration-300"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form className="space-y-3" onSubmit={handleOtpSubmit}>
            <div className="flex justify-between mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-8 h-8 sm:w-10 sm:h-10 text-center text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
                  disabled={loading}
                />
              ))}
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-3 sm:px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Verify OTP'}
              </button>
            </div>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-orange-300 hover:text-orange-400 transition-colors duration-300"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
            <div className="text-center mt-2">
              <Link
                to="/admin"
                className="text-xs text-orange-300 hover:text-orange-400 transition-colors duration-300"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form className="space-y-3" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-xs font-medium text-sky-100 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
                placeholder="Enter new password"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-sky-100 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-3 sm:px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Reset Password'}
              </button>
            </div>
            <div className="text-center mt-3">
              <Link
                to="/admin"
                className="text-xs text-orange-300 hover:text-orange-400 transition-colors duration-300"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;