import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.jsx";
import Orders from "./pages/Orders.jsx";
import Cart from "./pages/Cart.jsx";
import Collections from "./pages/Collections.jsx";
import Navbar from "./components/Navbar.jsx";
import About from "./pages/About.jsx";
import PlaceOrder from "./pages/PlaceOrder.jsx";
import Contact from "./pages/Contact.jsx";
import Footer from "./components/Footer.jsx";
import Product from "./pages/Product.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Account from "./pages/Account.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Delivery from "./pages/Delivery.jsx";
import AppContextProvider from "./context/AppContext.jsx";
import ShopContextProvider from "./context/ShopContext.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import GuestCheckout from "./pages/GuestCheckout.jsx";
import { useEffect, useContext, useRef } from "react";
import { AppContext } from "./context/AppContext.jsx";
import { ShopContext } from "./context/ShopContext.jsx";
import { toast } from "react-toastify";

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated, apiRequest, syncAfterGoogleLogin } = useContext(AppContext);
  const { fetchCart, fetchWishlist } = useContext(ShopContext);
  const googleAuthHandled = useRef(false);

  useEffect(() => {
    console.log("App initialized");
  }, [location.pathname]);

  useEffect(() => {
    const handleGoogleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(location.search);
      const loginSuccess = urlParams.get("login");
      const source = urlParams.get("source");

      if (loginSuccess === "success" && source === "google" && !googleAuthHandled.current) {
        googleAuthHandled.current = true;
        console.log("✅ Google OAuth successful, processing...");

        const oauthToken = urlParams.get("token");
        if (oauthToken) {
          localStorage.setItem("token", oauthToken);
        }

        // Extract local cart/wishlist data from URL parameters
        let localCart = [];
        let localWishlist = [];
        
        try {
          const localCartParam = urlParams.get("localCart");
          const localWishlistParam = urlParams.get("localWishlist");
          
          if (localCartParam) {
            localCart = JSON.parse(localCartParam);
          }
          if (localWishlistParam) {
            localWishlist = JSON.parse(localWishlistParam);
          }
        } catch (error) {
          console.error("❌ Error parsing local data:", error);
        }

        console.log("📦 Extracted local data for sync:", {
          cartItems: localCart.length,
          wishlistItems: localWishlist.length
        });

        // Clear URL parameters immediately
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        try {
          // First, check authentication to ensure user is logged in
          const authData = await isAuthenticated();
          
          if (authData.success && authData.user) {
            console.log("✅ User authenticated, starting sync...");
            
            // Sync cart/wishlist with backend
            if (localCart.length > 0 || localWishlist.length > 0) {
              await syncAfterGoogleLogin(localCart, localWishlist);
            } else {
              console.log("ℹ️ No local data to sync");
            }
            
            // Refresh cart and wishlist from server
            await fetchCart();
            await fetchWishlist();
          } else {
            console.log("ℹ️ Authentication check returned false, waiting for redirect to complete...");
          }
        } catch (error) {
          console.error("❌ Error during Google auth processing:", error);
        }
      }
    };

    handleGoogleAuthRedirect();
  }, [location, isAuthenticated, fetchCart, fetchWishlist, syncAfterGoogleLogin]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-sky-50 via-orange-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <Navbar />
      <ScrollToTop />
      {/* ✅ full-width main, no extra empty space on sides */}
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/guest-checkout" element={<GuestCheckout />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={1}
      />
    </div>
  );
};

const App = () => {
  return (
    <AppContextProvider>
      <ShopContextProvider>
        <AppContent />
      </ShopContextProvider>
    </AppContextProvider>
  );
};

export default App;