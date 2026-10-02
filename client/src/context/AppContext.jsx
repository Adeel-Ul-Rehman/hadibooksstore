import React, { createContext, useState, useEffect } from "react";
import "../toastStyles.css";
import axios from "axios";
import validator from "validator";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoogleAuthInProgress, setIsGoogleAuthInProgress] = useState(() => {
    // Check if we're in the middle of Google OAuth on initial load
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isGoogleOAuth = urlParams.get('login') === 'success' && urlParams.get('source') === 'google';
      
      if (isGoogleOAuth) {
        // Set start time for OAuth process
        sessionStorage.setItem('googleOAuthStartTime', Date.now().toString());
      }
      
      return isGoogleOAuth;
    }
    return false;
  });

  // Compute runtime API base URL:
  const computeRuntimeApiBase = () => {
    // Return the API host root (no trailing /api)
    const builtApi = import.meta.env.VITE_API_URL;
    if (builtApi) {
      return builtApi.replace(/\/api\/?$/, '');
    }
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    // Local development on localhost -> backend at localhost:4000
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `${protocol}//localhost:4000`;
    }
    // Default to same origin (no /api appended) — we'll add /api in requests
    return window.location.origin;
  };
  const apiUrl = computeRuntimeApiBase();

  useEffect(() => {
    // Set axios baseURL once at runtime so all apiRequest calls use the correct host
    // axios baseURL is the API host root (no trailing /api)
    axios.defaults.baseURL = apiUrl;
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      isAuthenticated();
    }
  }, []);

  const apiRequest = async (method, url, data = null, config = {}) => {
    console.log("🔵 API Request:", { method, url, data: data ? '[...]' : 'none' });
    setError(null);
    try {
      // Attach Authorization Bearer token from localStorage if available
      const token = localStorage.getItem("token");
      const headers = { ...config.headers };
      if (token && !headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${token}`;
      }
      const requestConfig = { ...config, headers, withCredentials: true };

      // Build a normalized URL so it always contains exactly one '/api' segment
      if (typeof url === 'string' && !url.startsWith('http')) {
        // remove leading '/api' if present
        let path = url.replace(/^\/api/, '');
        // ensure path starts with '/'
        if (!path.startsWith('/')) path = `/${path}`;
        const fullUrl = `${apiUrl.replace(/\/$/, '')}/api${path}`;
        console.log("🔵 Full API URL:", fullUrl);
        const response = await axios({ method, url: fullUrl, data, ...requestConfig });
        console.log("✅ API Response:", response.data);
        return response.data;
      }

      // absolute URL (http/https)
      const response = await axios({ method, url, data, ...requestConfig });
      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      const message =
        err.response?.data?.message || "An unexpected error occurred";
      if (err.response?.status !== 401) {
        setError(message);
      }
      // Only show session expired toast if NOT during Google OAuth and user exists
      if (err.response?.status === 401 && user && !isGoogleAuthInProgress) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("localCart");
        localStorage.removeItem("localWishlist");
        toast.error("Session expired. Please login again.");
      }
      throw err;
    }
  };

  const isAuthenticated = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("get", "/api/auth/is-auth");

      if (data.success && data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          lastName: data.user.lastName,
          email: data.user.email,
          isAccountVerified: data.user.isAccountVerified,
          address: data.user.address,
          postCode: data.user.postCode,
          city: data.user.city,
          country: data.user.country,
          shippingAddress: data.user.shippingAddress,
          mobileNumber: data.user.mobileNumber,
          profilePicture: data.user.profilePicture,
          authProvider: data.user.authProvider,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Clear Google OAuth flag and show success toast ONLY ONCE
        if (isGoogleAuthInProgress) {
          setIsGoogleAuthInProgress(false);
          
          // Show success toast only if not shown already
          const googleSuccessShown = sessionStorage.getItem('googleLoginSuccessShown');
          if (!googleSuccessShown) {
            sessionStorage.setItem('googleLoginSuccessShown', 'true');
            toast.success(`Welcome back, ${userData.name}!`);
            
            // Clear the flag after 5 seconds (in case user logs out and logs in again)
            setTimeout(() => {
              sessionStorage.removeItem('googleLoginSuccessShown');
            }, 5000);
          }
        }
        
        return data;
      } else {
        setUser(null);
        localStorage.removeItem("user");
        
        // Clear Google OAuth flag if in progress for more than 3 seconds
        if (isGoogleAuthInProgress) {
          const oauthStartTime = sessionStorage.getItem('googleOAuthStartTime');
          const currentTime = Date.now();
          
          if (oauthStartTime && (currentTime - parseInt(oauthStartTime)) > 3000) {
            setIsGoogleAuthInProgress(false);
            sessionStorage.removeItem('googleLoginErrorShown');
          }
        }
        
        return { success: false, message: "Not authenticated", user: null };
      }
    } catch (err) {
      if (err.response?.status === 401 && localStorage.getItem("user")) {
        localStorage.removeItem("user");
      }
      setUser(null);
      
      // Clear Google OAuth flag if in progress for more than 3 seconds
      if (isGoogleAuthInProgress) {
        const oauthStartTime = sessionStorage.getItem('googleOAuthStartTime');
        const currentTime = Date.now();
        
        if (oauthStartTime && (currentTime - parseInt(oauthStartTime)) > 3000) {
          setIsGoogleAuthInProgress(false);
          sessionStorage.removeItem('googleLoginErrorShown');
        }
      }
      
      return { success: false, message: "Not authenticated", user: null };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get local cart and wishlist data
      const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
      const localWishlist = JSON.parse(
        localStorage.getItem("localWishlist") || "[]"
      );

      console.log("📦 Sending local data to Google OAuth:", {
        cartItems: localCart.length,
        wishlistItems: localWishlist.length,
      });

      // Use computed apiUrl if set; otherwise fall back to current origin
      const baseUrl = apiUrl || (window?.location ? window.location.origin : "");

      // Pass local cart/wishlist as query parameters
      const params = new URLSearchParams();
      if (localCart.length > 0) {
        params.append("localCart", JSON.stringify(localCart));
      }
      if (localWishlist.length > 0) {
        params.append("localWishlist", JSON.stringify(localWishlist));
      }

      const googleAuthUrl = `${baseUrl}/api/auth/google?${params.toString()}`;

      console.log("📍 Redirecting to Google OAuth:", googleAuthUrl);

      window.location.href = googleAuthUrl;

      return { success: true, message: "Redirecting to Google..." };
    } catch (err) {
      console.error("Google login error:", err);
      setIsLoading(false);
      return {
        success: false,
        message: "Google login failed",
      };
    }
  };

  const syncAfterGoogleLogin = async (localCart, localWishlist) => {
    try {
      console.log("🔄 Syncing after Google login:", {
        cartItems: localCart.length,
        wishlistItems: localWishlist.length,
      });

      const data = await apiRequest("post", "/api/auth/google-sync", {
        localCart,
        localWishlist,
      });

      if (data.success) {
        console.log("✅ Google sync successful:", data);

        // Clear local storage if sync was successful
        if (data.cartSynced) {
          localStorage.removeItem("localCart");
          console.log("🗑️ Local cart cleared after successful sync");
        }
        if (data.wishlistSynced) {
          localStorage.removeItem("localWishlist");
          console.log("🗑️ Local wishlist cleared after successful sync");
        }

        // Show a single toast once per OAuth flow
        const toastShownKey = 'googleSyncToastShown';
        if (!sessionStorage.getItem(toastShownKey)) {
          if (data.syncErrors && data.syncErrors.length > 0) {
            console.warn("Google sync errors:", data.syncErrors);
            toast.warning(
              "Some items could not be synced. Please check your cart/wishlist."
            );
          } else {
            toast.success("Your cart and wishlist have been synced!");
          }
          sessionStorage.setItem(toastShownKey, '1');
        }
      } else {
        console.error("❌ Google sync failed:", data.message);
        toast.error(
          "Failed to sync cart/wishlist. Your local items are preserved."
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Google sync error:", error);
      toast.error("Error during sync. Your local items are preserved.");
      return { success: false, message: "Sync failed" };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    const { name, lastName, email, password, confirmPassword } = userData;
    if (!name || !email || !password || !confirmPassword) {
      setIsLoading(false);
      return {
        success: false,
        message: "Name, email, password, and confirm password are required",
      };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }
    if (
      password.length < 8 ||
      !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(password)
    ) {
      setIsLoading(false);
      return { success: false, message: "Invalid password format" };
    }
    if (password !== confirmPassword) {
      setIsLoading(false);
      return { success: false, message: "Passwords do not match" };
    }
    if (name.length > 20) {
      setIsLoading(false);
      return { success: false, message: "Name must not exceed 20 characters" };
    }
    if (lastName && lastName.length > 20) {
      setIsLoading(false);
      return {
        success: false,
        message: "Last name must not exceed 20 characters",
      };
    }

    try {
      const data = await apiRequest("post", "/api/auth/register", userData);
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    if (!email || !password) {
      setIsLoading(false);
      return { success: false, message: "Email and password are required" };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }

    const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
    const localWishlist = JSON.parse(
      localStorage.getItem("localWishlist") || "[]"
    );
    try {
      const data = await apiRequest("post", "/api/auth/login", {
        email,
        password,
        localCart,
        localWishlist,
      });
      if (data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        await isAuthenticated();

        if (data.wishlistSynced) {
          localStorage.removeItem("localWishlist");
        }
        if (data.cartSynced) {
          localStorage.removeItem("localCart");
        }
        if (data.syncErrors && data.syncErrors.length > 0) {
          console.warn("Login sync errors:", data.syncErrors);
        }
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (otp) => {
    setIsLoading(true);
    setError(null);
    if (!otp || !/^\d{6}$/.test(otp)) {
      setIsLoading(false);
      return { success: false, message: "Invalid OTP format" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/verify-account", {
        otp,
      });
      if (data.success) {
        setUser((prev) => ({ ...prev, isAccountVerified: true }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, isAccountVerified: true })
        );
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Email verification failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerifyOtp = async (userId) => {
    setIsLoading(true);
    setError(null);
    if (!userId) {
      setIsLoading(false);
      return { success: false, message: "User ID is required" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/send-verify-otp", {
        userId,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendResetOtp = async (email) => {
    setIsLoading(true);
    setError(null);
    if (!email || !validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Valid email is required" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/send-reset-otp", {
        email,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send reset OTP",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetOtp = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    if (!email || !otp || !validator.isEmail(email) || !/^\d{6}$/.test(otp)) {
      setIsLoading(false);
      return { success: false, message: "Valid email and OTP are required" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/verify-reset-otp", {
        email,
        otp,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest("get", "/api/orders/get");
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to fetch orders",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setIsLoading(true);
    setError(null);
    console.log("📦 Creating user order:", orderData);
    try {
      const data = await apiRequest("post", "/api/orders/create", orderData);
      return data;
    } catch (err) {
      console.error("❌ Create order error:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create order",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    setIsLoading(true);
    setError(null);
    if (!email || !otp || !newPassword || !confirmPassword) {
      setIsLoading(false);
      return { success: false, message: "All fields are required" };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }
    if (!/^\d{6}$/.test(otp)) {
      setIsLoading(false);
      return { success: false, message: "Invalid OTP format" };
    }
    if (
      newPassword.length < 8 ||
      !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(newPassword)
    ) {
      setIsLoading(false);
      return { success: false, message: "Invalid password format" };
    }
    if (newPassword !== confirmPassword) {
      setIsLoading(false);
      return { success: false, message: "Passwords do not match" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Password reset failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("localCart");
    localStorage.removeItem("localWishlist");
    // Clear google sync toast guard so a future login can show the notification again
    try { sessionStorage.removeItem('googleSyncToastShown'); } catch(e){}
    toast.success("Logged out");
    try {
      const data = await apiRequest("post", "/api/auth/logout");
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Logout failed",
      };
    }
  };

  const updateUser = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(
        "put",
        "/api/auth/update-profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          lastName: data.user.lastName,
          email: data.user.email,
          address: data.user.address,
          postCode: data.user.postCode,
          city: data.user.city,
          country: data.user.country,
          shippingAddress: data.user.shippingAddress,
          mobileNumber: data.user.mobileNumber,
          profilePicture: data.user.profilePicture,
          isAccountVerified: data.user.isAccountVerified,
        });
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Profile update failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(
        "delete",
        "/api/auth/remove-profile-picture"
      );
      if (data.success) {
        setUser((prev) => ({ ...prev, profilePicture: null }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, profilePicture: null })
        );
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to remove profile picture",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (email, password) => {
    setIsLoading(true);
    setError(null);
    if (!email || !password) {
      setIsLoading(false);
      return { success: false, message: "Email and password are required" };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }
    try {
      const data = await apiRequest("delete", "/api/auth/delete-account", {
        email,
        password,
      });
      if (data.success) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("localCart");
        localStorage.removeItem("localWishlist");
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Account deletion failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPaymentProof = async (orderId, file) => {
    setIsLoading(true);
    setError(null);
    if (!orderId || !file) {
      setIsLoading(false);
      return {
        success: false,
        message: "Order ID and proof file are required",
      };
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("proof", file);

    try {
      const data = await apiRequest(
        "post",
        "/api/checkout/upload-proof",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to upload payment proof",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Add guest payment proof upload function
  const uploadGuestPaymentProof = async (orderId, guestEmail, file) => {
    setIsLoading(true);
    setError(null);
    if (!orderId || !guestEmail || !file) {
      setIsLoading(false);
      return {
        success: false,
        message: "Order ID, guest email and proof file are required",
      };
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("guestEmail", guestEmail);
    formData.append("proof", file);

    try {
      const data = await apiRequest(
        "post",
        "/api/checkout/guest-upload-proof",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to upload payment proof",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        error,
        isGoogleAuthInProgress,
        setIsGoogleAuthInProgress,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
        verifyEmail,
        sendVerifyOtp,
        sendResetOtp,
        verifyResetOtp,
        resetPassword,
        apiRequest,
        setUser,
        removeProfilePicture,
        isAuthenticated,
        uploadPaymentProof,
        uploadGuestPaymentProof, // Add this new function
        fetchUserOrders,
        createOrder,
        loginWithGoogle,
        syncAfterGoogleLogin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;