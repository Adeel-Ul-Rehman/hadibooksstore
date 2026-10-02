import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { backendURL } from "../App";

const Dashboard = () => {
  const { admin, fetchAdminProfile } = useContext(AppContext);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      if (!admin.token) {
        if (mounted) {
          setIsLoading(false);
          setError("Please log in to view dashboard");
        }
        return;
      }
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      if (mounted) {
        setIsLoading(true);
        setError("");
      }
      try {
        const [productsRes, ordersRes, orderStatsRes] = await Promise.all([
          axios.get(`${backendURL}/api/adminCtrl/list`, {
            params: { page: 1, limit: 1 },
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          }).catch(() => ({ data: { success: true, pagination: { total: 0 } } })),
          axios.get(`${backendURL}/api/adminCtrl/all`, {
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          }).catch(() => ({ data: { success: true, orders: [] } })),
          axios.get(`${backendURL}/api/adminCtrl/order-stats`, {
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          }).catch(() => ({
            data: {
              success: true,
              stats: {
                totalOrders: 0,
                pendingOrders: 0,
                processingOrders: 0,
                deliveredOrders: 0,
                totalRevenue: 0,
              },
            },
          })),
        ]);

        const productsTotal = productsRes.data.success
          ? productsRes.data.pagination?.total || 0
          : 0;
        const ordersTotal = ordersRes.data.success
          ? ordersRes.data.orders?.length || 0
          : 0;
        const orderStats = orderStatsRes.data.success
          ? orderStatsRes.data.stats
          : {
              totalOrders: 0,
              pendingOrders: 0,
              processingOrders: 0,
              deliveredOrders: 0,
              totalRevenue: 0,
            };

        if (mounted) {
          setStats({
            products: productsTotal,
            orders: ordersTotal,
            ...orderStats,
          });
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error.response?.data?.message || error.message);
        if (mounted) setError("Failed to fetch dashboard data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (!admin.id || !admin.token) {
      fetchAdminProfile().then(() => {
        if (admin.token && mounted) {
          fetchStats();
        } else if (mounted) {
          setIsLoading(false);
          setError("Please log in to view dashboard");
        }
      }).catch(() => {
        if (mounted) {
          setIsLoading(false);
          setError("Failed to authenticate. Please log in.");
        }
      });
    } else {
      fetchStats();
    }

    return () => {
      mounted = false;
      hasLoadedRef.current = false; // Reset on unmount
    };
  }, [admin.token, admin.id, fetchAdminProfile]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-orange-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Admin Dashboard</h2>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 text-xs sm:text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {admin && (
          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Admin Details
            </h3>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-700/50 p-1 shadow-md border border-gray-600/50 flex items-center justify-center">
                {admin.profilePicture ? (
                  <img
                    src={admin.profilePicture}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/100x100/gray/white?text=A")
                    }
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-orange-500">
                    {admin.name?.charAt(0).toUpperCase() || "A"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Name:</strong> {admin.name || "N/A"}
                </p>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Email:</strong> {admin.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white">Products</h3>
            <p className="text-orange-300 text-xl sm:text-2xl font-medium">
              {stats.products}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Total products in catalog</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white">Total Orders</h3>
            <p className="text-orange-300 text-xl sm:text-2xl font-medium">
              {stats.totalOrders}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">All orders placed</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white">Pending Orders</h3>
            <p className="text-orange-300 text-xl sm:text-2xl font-medium">
              {stats.pendingOrders}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Orders awaiting processing</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Processing Orders
            </h3>
            <p className="text-orange-300 text-xl sm:text-2xl font-medium">
              {stats.processingOrders}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Orders being processed</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Delivered Orders
            </h3>
            <p className="text-orange-300 text-xl sm:text-2xl font-medium">
              {stats.deliveredOrders}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Orders successfully delivered
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white">Total Revenue</h3>
            <p className="text-orange-300 text-xl sm:text-2xl font-medium">
              Rs. {(stats.totalRevenue || 0).toFixed(2)}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Revenue from completed orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;