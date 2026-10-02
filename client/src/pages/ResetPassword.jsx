import React, { useState, useRef, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import validator from "validator";
import Title from "../components/Title";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { sendResetOtp, verifyResetOtp, resetPassword } =
    useContext(AppContext);
  const [step, setStep] = useState("email"); // email, otp, password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validator.isEmail(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validator.isEmail(email)) {
      setEmailError("Invalid email format");
      toast.error("Invalid email format");
      setLoading(false);
      return;
    }
    try {
      const data = await sendResetOtp(email);
      if (data.success) {
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
        setStep("otp");
        toast.success("OTP sent to your email");
      } else {
        setEmailError(data.message || "Failed to send OTP");
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setEmailError(error.response?.data?.message || "Failed to send OTP");
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
      setOtpError("");
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split("").slice(0, 6));
      inputRefs.current[5].focus();
      setOtpError("");
    } else {
      setOtpError("Please paste a valid 6-digit OTP");
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    try {
      const data = await sendResetOtp(email);
      if (data.success) {
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
        toast.success("New OTP sent to your email");
      } else {
        setOtpError(data.message || "Failed to resend OTP");
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to resend OTP");
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otpString = otp.join("");
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      setOtpError("Please enter a valid 6-digit OTP");
      toast.error("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }
    try {
      const data = await verifyResetOtp(email, otpString);
      if (data.success) {
        setStep("password");
        toast.success("OTP verified successfully");
      } else {
        setOtpError(data.message || "Invalid OTP");
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to verify OTP");
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      if (value.length > 50) {
        setNewPasswordError("Password cannot exceed 50 characters");
        return;
      }
      if (
        value &&
        !validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0,
        })
      ) {
        setNewPasswordError(
          "Password must be at least 8 characters with one letter and one number"
        );
      } else {
        setNewPasswordError("");
      }
      if (confirmPassword && value !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else if (confirmPassword) {
        setConfirmPasswordError("");
      }
      setNewPassword(value);
    } else if (name === "confirmPassword") {
      if (value.length > 50) {
        setConfirmPasswordError("Password cannot exceed 50 characters");
        return;
      }
      if (value && value !== newPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
      setConfirmPassword(value);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      setNewPasswordError(
        "Password must be at least 8 characters with one letter and one number"
      );
      toast.error(
        "Password must be at least 8 characters with one letter and one number"
      );
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    if (newPassword.length > 50) {
      setNewPasswordError("Password cannot exceed 50 characters");
      toast.error("Password cannot exceed 50 characters");
      setLoading(false);
      return;
    }
    try {
      const data = await resetPassword(
        email,
        otp.join(""),
        newPassword,
        confirmPassword
      );
      if (data.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        setNewPasswordError(data.message || "Failed to reset password");
        toast.error(data.message || "Failed to reset password");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";
      setNewPasswordError(errorMessage);
      toast.error(errorMessage);
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]"
    >
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <Title text1="RESET" text2="PASSWORD" />
          <p className="mt-2 text-sm text-gray-800">
            {step === "email" && (
              <>
                Enter your email to receive a password reset OTP.{" "}
                <Link
                  to="/login"
                  className="font-medium text-gray-800 hover:text-gray-900"
                >
                  Back to sign in
                </Link>
              </>
            )}
            {step === "otp" && `Enter the 6-digit OTP sent to ${email}.`}
            {step === "password" && "Enter and confirm your new password."}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-4"
        >
          {step === "email" && (
            <form
              className="space-y-6"
              onSubmit={handleEmailSubmit}
              aria-label="Email form"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className={`focus:ring-[#00308F] focus:border-[#00308F] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800 ${
                      emailError ? "border-red-500" : ""
                    }`}
                    placeholder="you@example.com"
                    aria-invalid={!!emailError}
                    aria-describedby="email-error"
                  />
                  {emailError && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="email-error"
                    >
                      {emailError}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-2 bg-[#00308F] hover:bg-[#002570] text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={loading ? "Sending OTP" : "Send OTP"}
              >
                <span className="flex justify-center items-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </span>
              </button>
            </form>
          )}
          {step === "otp" && (
            <form
              className="space-y-6"
              onSubmit={handleOtpSubmit}
              aria-label="OTP verification form"
            >
              <p className="text-sm text-gray-800 text-center">
                Enter the 6-digit OTP sent to {email}.
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className={`w-10 h-10 text-center text-lg font-semibold border rounded-md focus:ring-[#00308F] focus:border-[#00308F] sm:text-sm text-gray-800 ${
                      otpError
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0"
                    aria-invalid={!!otpError}
                    aria-describedby="otp-error"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
              {otpError && (
                <p
                  className="text-sm text-red-600 text-center"
                  id="otp-error"
                >
                  {otpError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-2 bg-[#00308F] hover:bg-[#002570] text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={loading ? "Verifying OTP" : "Verify OTP"}
              >
                <span className="flex justify-center items-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying OTP...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </span>
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-sm font-medium text-gray-800 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Resend OTP"
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
          {step === "password" && (
            <form
              className="space-y-6"
              onSubmit={handlePasswordSubmit}
              aria-label="Password reset form"
            >
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-900"
                >
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className={`focus:ring-[#00308F] focus:border-[#00308F] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800 ${
                      newPasswordError ? "border-red-500" : ""
                    }`}
                    placeholder="••••••••"
                    aria-invalid={!!newPasswordError}
                    aria-describedby="newPassword-error"
                  />
                  {newPasswordError && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="newPassword-error"
                    >
                      {newPasswordError}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-900"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={handlePasswordChange}
                    className={`focus:ring-[#00308F] focus:border-[#00308F] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800 ${
                      confirmPasswordError ? "border-red-500" : ""
                    }`}
                    placeholder="••••••••"
                    aria-invalid={!!confirmPasswordError}
                    aria-describedby="confirmPassword-error"
                  />
                  {confirmPasswordError && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="confirmPassword-error"
                    >
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-2 bg-[#00308F] hover:bg-[#002570] text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={loading ? "Resetting Password" : "Reset Password"}
              >
                <span className="flex justify-center items-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;