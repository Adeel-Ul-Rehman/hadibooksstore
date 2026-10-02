import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import validator from "validator";
import Title from "../components/Title";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath =
    new URLSearchParams(location.search).get("redirect") || "/account";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    if (!validator.isEmail(formData.email)) {
      toast.error("Invalid email format");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const data = await login(formData.email, formData.password);
      if (data.success) {
        if (data.user.isAccountVerified) {
          toast.success("Login successful");
          navigate(redirectPath, { replace: true });
        } else {
          toast.info("Please verify your email to continue");
          navigate("/verify-otp", {
            state: { email: formData.email, userId: data.user?.id },
            replace: true },
          );
        }
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Get local cart and wishlist to preserve during Google login
      const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
      const localWishlist = JSON.parse(localStorage.getItem("localWishlist") || "[]");
      
      console.log('📦 Preserving local data during Google login:', {
        cartItems: localCart.length,
        wishlistItems: localWishlist.length
      });

      const result = await loginWithGoogle();
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.info("Redirecting to Google...");
      }
    } catch (err) {
      toast.error("Google login failed. Please try again.");
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
          <Title text1="SIGN" text2="IN" />
          <p className="mt-2 text-sm text-gray-800">
            Or{" "}
            <Link
              to="/register"
              className="text-blue-800 hover:text-blue-900 hover:underline transition-colors duration-200"
            >
              create a new account
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-6"
        >
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            aria-label="Login form"
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
                  <FiMail className="h-5 w-5 text-gray-500" aria-hidden="true" />
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
                  <FiLock className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border text-gray-800"
                  placeholder="••••••••"
                  aria-describedby="password-error"
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
              <div className="flex items-center flex-shrink-0">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  aria-label="Remember me"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs sm:text-sm text-gray-800 whitespace-nowrap"
                >
                  Remember me
                </label>
              </div>

              <div className="text-xs sm:text-sm flex-shrink-0">
                <Link
                  to="/reset-password"
                  className="font-medium text-[#00308F] hover:text-[#002266] transition-all duration-300 whitespace-nowrap"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={loading ? "Logging In" : "Log In"}
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
                      Logging In...
                    </>
                  ) : (
                    "Log In"
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-3 text-sm text-gray-500">Or</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center cursor-pointer justify-center gap-3 py-3 px-4 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;