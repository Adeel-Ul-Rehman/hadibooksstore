import React, { useState, useRef, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import validator from "validator";
import Title from "../components/Title";

const Register = () => {
  const { register, verifyEmail, sendVerifyOtp, setUser } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState("register"); // register, verify
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userId, setUserId] = useState(null); // Store userId (string UUID)
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const otpSectionRef = useRef(null);

  // Scroll OTP input into view when step changes to 'verify'
  useEffect(() => {
    if (step === "verify" && otpSectionRef.current) {
      const yOffset = -80;
      const y = otpSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      // Focus first OTP input
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split("").slice(0, 6));
      inputRefs.current[5].focus();
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !validator.isLength(formData.name, { max: 20 }) ||
      !validator.matches(formData.name, /^[a-zA-Z0-9\s]+$/)
    ) {
      toast.error(
        "First name must be 20 characters or less and contain only letters, numbers, or spaces"
      );
      setLoading(false);
      return;
    }

    if (
      formData.lastName &&
      (!validator.isLength(formData.lastName, { max: 20 }) ||
        !validator.matches(formData.lastName, /^[a-zA-Z0-9\s]+$/))
    ) {
      toast.error(
        "Last name must be 20 characters or less and contain only letters, numbers, or spaces"
      );
      setLoading(false);
      return;
    }

    if (!validator.isEmail(formData.email)) {
      toast.error("Invalid email format");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (
      !validator.isStrongPassword(formData.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one letter and one number"
      );
      setLoading(false);
      return;
    }

    try {
      const data = await register({
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (data.success) {
        setUserId(data.user.id); // Store string UUID
        setStep("verify");
        setResendTimer(60);
        toast.success(
          "Registration successful. Please verify your email with the OTP sent."
        );
      } else if (data.message.includes("unverified")) {
        setUserId(data.user.id); // String UUID
        setStep("verify");
        setResendTimer(60);
        toast.info("Account exists but is unverified. New OTP sent.");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otpString = otp.join("");
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast.error("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }
    try {
      const data = await verifyEmail(otpString);
      if (data.success) {
        toast.success("Email verified successfully");
        // Set user in context for auto-login
        setUser({
          id: data.user.id,
          name: data.user.name,
          lastName: data.user.lastName,
          email: data.user.email,
          // Add other user properties as needed
        });
        // Store token in localStorage if your app uses it
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        // Navigate to dashboard or homepage instead of login
        navigate("/");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !userId) return;
    setLoading(true);
    try {
      const data = await sendVerifyOtp(userId); // Pass userId (string UUID)
      if (data.success) {
        setResendTimer(60);
        toast.success("New OTP sent to your email");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
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
          <Title text1="CREATE" text2="ACCOUNT" />
          <p className="mt-2 text-sm text-gray-800">
            Or{" "}
            <Link
              to="/login"
              className="text-blue-800 hover:text-blue-900 hover:underline transition-colors duration-200"
            >
              sign in to your existing account
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-4"
        >
          {step === "register" && (
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              aria-label="Registration form"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900"
                >
                  First Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800"
                    placeholder="John"
                    aria-describedby="name-error"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-900"
                >
                  Last Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800"
                    placeholder="Doe"
                    aria-describedby="lastName-error"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800"
                    placeholder="you@example.com"
                    aria-describedby="email-error"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800"
                    placeholder="••••••••"
                    aria-describedby="password-error"
                  />
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800"
                    placeholder="••••••••"
                    aria-describedby="confirmPassword-error"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  aria-label="Agree to Terms and Conditions"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-800"
                >
                  I agree to the{" "}
                  <a
                    href="https://res.cloudinary.com/dzxeahjul/raw/upload/v1757634407/Terms_and_Conditions_for_Hadi_BookStore_jqjkkz.docx"
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full py-2 bg-[#00308F] hover:bg-[#002570] text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label={loading ? "Signing Up" : "Sign Up"}
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
                        Signing Up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {step === "verify" && (
            <form
              className="space-y-6"
              onSubmit={handleOtpSubmit}
              aria-label="OTP verification form"
              ref={otpSectionRef}
            >
              <p className="text-sm text-gray-800 text-center">
                Enter the 6-digit OTP sent to {formData.email}
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="tel"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-10 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-800"
                    placeholder="0"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-2 bg-[#00308F] hover:bg-[#002570] text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={loading ? "Verifying OTP" : "Verify OTP"}
              >
                <span className="flex items-center justify-center w-full">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;