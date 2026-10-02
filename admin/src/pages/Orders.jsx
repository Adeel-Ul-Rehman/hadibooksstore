import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { backendURL } from "../App";
import assets from "../assets/assets";

// Create axios instance with no caching
const axiosInstance = axios.create({
  adapter: ['xhr', 'http'],
});

const Orders = () => {
  const { admin } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, orderId: null, isGuest: false });

  const fetchOrders = async (status = "", paymentStatus = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(`${backendURL}/api/adminCtrl/all`, {
        params: { 
          status, 
          paymentStatus,
          _t: new Date().getTime() // Cache buster with unique timestamp
        },
        headers: { 
          Authorization: `Bearer ${admin.token}`
        },
        withCredentials: true,
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setFilteredOrders(response.data.orders || []);
      } else {
        setError(response.data.message);
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter, paymentStatusFilter);
  }, [admin.token, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${order.user?.name || ""} ${order.user?.lastName || ""}`.toLowerCase();
      const guestName = `${order.guest?.name || ""}`.toLowerCase();
      const userEmail = (order.user?.email || "").toLowerCase();
      const guestEmail = (order.guest?.email || "").toLowerCase();
      const userPhone = (order.user?.mobileNumber || "").toLowerCase();
      const guestPhone = (order.guest?.phone || "").toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        fullName.includes(searchLower) ||
        guestName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        guestEmail.includes(searchLower) ||
        userPhone.includes(searchLower) ||
        guestPhone.includes(searchLower)
      );
    });
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const handleStatusUpdate = async (orderId, status) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(
        `${backendURL}/api/adminCtrl/status/${orderId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${admin.token}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setSuccess("Order status updated successfully");
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
        setFilteredOrders(
          filteredOrders.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId, isGuest) => {
    setDeleteConfirmation({ show: true, orderId, isGuest });
  };

  const confirmDelete = async () => {
    const { orderId, isGuest } = deleteConfirmation;
    setDeleteConfirmation({ show: false, orderId: null, isGuest: false });

    setError("");
    setSuccess("");
    try {
      const endpoint = isGuest 
        ? `${backendURL}/api/adminCtrl/delete-guest-order/${orderId}`
        : `${backendURL}/api/adminCtrl/delete-order/${orderId}`;
      
      const response = await axiosInstance.delete(endpoint, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });

      if (response.data.success) {
        setSuccess("Order deleted successfully from database");
        // Remove from state immediately
        setOrders(orders.filter((o) => o.id !== orderId));
        setFilteredOrders(filteredOrders.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete order");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, orderId: null, isGuest: false });
  };

  const handleOrderDetailsUpdate = async (orderId, updateData) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(
        `${backendURL}/api/adminCtrl/status/${orderId}`,
        {
          status: selectedOrder.status,
          ...updateData,
        },
        {
          headers: { Authorization: `Bearer ${admin.token}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setSuccess("Order details updated successfully");
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, ...updateData } : o))
        );
        setFilteredOrders(
          filteredOrders.map((o) =>
            o.id === orderId ? { ...o, ...updateData } : o
          )
        );
        setSelectedOrder({ ...selectedOrder, ...updateData });
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order details");
    }
  };

  const handleVerifyPayment = async (orderId, action) => {
    setVerifyingPayment(true);
    setError("");
    setSuccess("");
    try {
      const updateData = {
        status: action === "approve" ? "confirmed" : "cancelled",
      };

      if (action === "approve") {
        updateData.paymentStatus = "paid";
      } else {
        updateData.paymentStatus = "failed";
      }

      const response = await axios.put(
        `${backendURL}/api/adminCtrl/status/${orderId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${admin.token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess(
          action === "approve"
            ? "Payment verified and order confirmed successfully"
            : "Payment rejected and order cancelled"
        );
        setOrders(
          orders.map((o) => {
            if (o.id === orderId) {
              return {
                ...o,
                status: updateData.status,
                paymentStatus: updateData.paymentStatus,
                payment: {
                  ...o.payment,
                  status: action === "approve" ? "completed" : "failed",
                },
              };
            }
            return o;
          })
        );
        setFilteredOrders(
          filteredOrders.map((o) => {
            if (o.id === orderId) {
              return {
                ...o,
                status: updateData.status,
                paymentStatus: updateData.paymentStatus,
                payment: {
                  ...o.payment,
                  status: action === "approve" ? "completed" : "failed",
                },
              };
            }
            return o;
          })
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: updateData.status,
            paymentStatus: updateData.paymentStatus,
            payment: {
              ...selectedOrder.payment,
              status: action === "approve" ? "completed" : "failed",
            },
          });
        }
        setShowPaymentProof(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "processing":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "ready_for_shipment":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "shipped":
        return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "out_for_delivery":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "refunded":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "partially_refunded":
        return "bg-pink-400/20 text-pink-200 border-pink-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "not_paid":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "JazzCash":
        return "💳";
      case "EasyPaisa":
        return "💳";
      case "BankTransfer":
        return "🏦";
      case "cod":
        return "💰";
      default:
        return "💳";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return `Rs. ${price?.toFixed(2) || "0.00"}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Order Management
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage and track customer orders</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
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

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl text-green-200 text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {success}
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 sm:p-6 shadow-2xl mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">
                Search Orders
              </h2>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID, Name, Email, or Mobile"
                  className="flex-1 sm:w-64 px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
                <button
                  onClick={() => fetchOrders(statusFilter, paymentStatusFilter)}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-xl text-orange-300 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Refresh orders from database"
                >
                  {loading ? "..." : "🔄 Refresh"}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h4 className="text-lg font-semibold text-white">
                Filter Orders
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_shipment">Ready for Shipment</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                </select>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="not_paid">Not Paid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-orange-500 mx-auto"
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
              <p className="mt-4 text-gray-400">Loading orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
            <p className="text-gray-400 text-lg">There is no order yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 sm:p-6 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white">
                        {order.isGuest ? (
                          order.guest?.name || 'Guest'
                        ) : (
                          `${order.user?.name || ''} ${order.user?.lastName || ''}`.trim() || 'N/A'
                        )}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.isGuest
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}
                      >
                        {order.isGuest ? '👤 Guest' : '✓ Registered'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm text-white font-semibold">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    Items ({order.items.length})
                  </p>
                  <div className="mt-1 space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center text-sm text-gray-300"
                      >
                        <span className="truncate flex-1">
                          {item.product?.name || "Unknown Product"}
                        </span>
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {(order.payment?.paymentMethod || order.paymentMethod) ? (
                  <div className="mb-4 p-3 bg-gray-700/30 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getPaymentMethodIcon(order.payment?.paymentMethod || order.paymentMethod)}
                      </span>
                      <span className="text-sm text-white font-medium capitalize">
                        {(order.payment?.paymentMethod || order.paymentMethod || '')
                          .toString()
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order.id, e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="ready_for_shipment">
                      Ready for Shipment
                    </option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                    <option value="partially_refunded">
                      Partially Refunded
                    </option>
                  </select>
                  <button
                    onClick={() =>
                      setSelectedOrder({
                        ...order,
                        trackingId: order.trackingId || "",
                        shippingMethod: order.shippingMethod || "",
                      })
                    }
                    className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600 border border-blue-500 text-white rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    title="View Details"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.5-2.5c-1.83-3.33-5.5-5.5-9.5-5.5S4.33 6.17 2.5 9.5 4.33 15.83 8.33 18.17c1.5 1.17 3.17 2 5.17 2s3.67-.83 5.17-2c4-2.34 5.83-5.67 5.83-9.17z"
                      />
                    </svg>
                    Details
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id, order.isGuest)}
                    className="px-4 py-2 bg-red-600/50 hover:bg-red-600 border border-red-500 text-white rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    title="Delete Order from Database"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPaymentProof &&
          selectedOrder &&
          selectedOrder.payment &&
          selectedOrder.payment.paymentProof && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
                  <h3 className="text-xl font-bold text-white">
                    Payment Proof Verification - Order #
                    {selectedOrder.id.slice(0, 8)}
                  </h3>
                  <button
                    onClick={() => setShowPaymentProof(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Method</p>
                        <p className="text-white font-medium">
                          {selectedOrder.payment.paymentMethod}{" "}
                          {getPaymentMethodIcon(
                            selectedOrder.payment.paymentMethod
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Amount</p>
                        <p className="text-white font-medium">
                          {formatPrice(selectedOrder.totalPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Current Status</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            selectedOrder.paymentStatus
                          )}`}
                        >
                          {selectedOrder.paymentStatus
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Order Status</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Payment Proof Screenshot
                    </h4>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <img
                        src={selectedOrder.payment.paymentProof}
                        alt="Payment Proof"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-600/50"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Payment+Proof+Not+Available";
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Click on image to enlarge (if needed)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() =>
                        handleVerifyPayment(selectedOrder.id, "approve")
                      }
                      disabled={
                        verifyingPayment ||
                        selectedOrder.paymentStatus === "paid"
                      }
                      className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        verifyingPayment ||
                        selectedOrder.paymentStatus === "paid"
                          ? "bg-green-600/30 text-green-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {verifyingPayment ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Verifying...
                        </>
                      ) : selectedOrder.paymentStatus === "paid" ? (
                        "Payment Verified ✓"
                      ) : (
                        "Verify & Confirm Payment"
                      )}
                    </button>

                    <button
                      onClick={() =>
                        handleVerifyPayment(selectedOrder.id, "reject")
                      }
                      disabled={verifyingPayment}
                      className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        verifyingPayment
                          ? "bg-red-600/30 text-red-300 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {verifyingPayment ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Processing...
                        </>
                      ) : (
                        "Reject Payment"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {selectedOrder && !showPaymentProof && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Order Details #{selectedOrder.id.slice(0, 8)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Customer Information
                  </h4>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Profile Picture</p>
                    {selectedOrder.user?.profilePicture ? (
                      <img
                        src={selectedOrder.user.profilePicture}
                        alt="Profile"
                        className="w-16 h-16 object-cover rounded-full"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/64")
                        }
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                        {selectedOrder.user?.name?.charAt(0).toUpperCase() ||
                          "G"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white">
                        {selectedOrder.isGuest ? (
                          selectedOrder.guest?.name || 'Guest'
                        ) : (
                          `${selectedOrder.user?.name || ''} ${selectedOrder.user?.lastName || ''}`.trim() || 'N/A'
                        )}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedOrder.isGuest
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}
                      >
                        {selectedOrder.isGuest ? '👤 Guest Order' : '✓ Registered User'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white">
                      {selectedOrder.isGuest ? (selectedOrder.guest?.email || 'N/A') : (selectedOrder.user?.email || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mobile Number</p>
                    <p className="text-sm text-white">
                      {selectedOrder.isGuest ? (selectedOrder.guest?.phone || 'N/A') : (selectedOrder.user?.mobileNumber || 'N/A')}
                    </p>
                  </div>
                  {selectedOrder.isGuest && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">City</p>
                        <p className="text-sm text-white">{selectedOrder.city || selectedOrder.guest?.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Postal Code</p>
                        <p className="text-sm text-white">{selectedOrder.postCode || selectedOrder.guest?.postCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Country</p>
                        <p className="text-sm text-white">{selectedOrder.country || selectedOrder.guest?.country || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm text-white">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Order Information
                  </h4>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {selectedOrder.paymentStatus
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm text-white font-semibold">
                      {formatPrice(selectedOrder.totalPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Taxes</p>
                    <p className="text-sm text-white">
                      {formatPrice(selectedOrder.taxes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipping Fee</p>
                    <p className="text-sm text-white">
                      {formatPrice(selectedOrder.shippingFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm text-white">
                      {(selectedOrder.payment?.paymentMethod || selectedOrder.paymentMethod || "N/A").toString()} {getPaymentMethodIcon(selectedOrder.payment?.paymentMethod || selectedOrder.paymentMethod)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipping Method</p>
                    <p className="text-sm text-white">
                      {selectedOrder.shippingMethod || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Shipping Address
                </h4>
                <div className="text-sm text-white bg-gray-700/50 rounded-xl p-4 space-y-1">
                  <p>{selectedOrder.shippingAddress || "No shipping address provided"}</p>
                  {(selectedOrder.city || selectedOrder.guest?.city) && (
                    <p>City: {selectedOrder.city || selectedOrder.guest?.city}</p>
                  )}
                  {(selectedOrder.postCode || selectedOrder.guest?.postCode) && (
                    <p>Postal Code: {selectedOrder.postCode || selectedOrder.guest?.postCode}</p>
                  )}
                  {(selectedOrder.country || selectedOrder.guest?.country) && (
                    <p>Country: {selectedOrder.country || selectedOrder.guest?.country}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Tracking Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tracking ID</p>
                    <input
                      type="text"
                      value={selectedOrder.trackingId}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          trackingId: e.target.value,
                        })
                      }
                      placeholder="Enter Tracking ID"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Shipping Method
                    </p>
                    <select
                      value={selectedOrder.shippingMethod}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          shippingMethod: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    >
                      <option value="">Select Shipping Method</option>
                      <option value="tcs">TCS</option>
                      <option value="leopard">Leopard</option>
                      <option value="trax">Trax</option>
                      <option value="postex">PostEx</option>
                      <option value="pakistan_post">Pakistan Post</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Estimated Delivery
                    </p>
                    <input
                      type="date"
                      value={
                        selectedOrder.estimatedDelivery
                          ? new Date(selectedOrder.estimatedDelivery)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          estimatedDelivery: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                    {!selectedOrder.estimatedDelivery && (
                      <p className="text-xs text-gray-500 mt-2">
                        No estimated delivery set
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      handleOrderDetailsUpdate(selectedOrder.id, {
                        trackingId: selectedOrder.trackingId,
                        shippingMethod: selectedOrder.shippingMethod,
                        estimatedDelivery: selectedOrder.estimatedDelivery,
                      })
                    }
                    className="w-full px-4 py-2 bg-blue-600/50 hover:bg-blue-600 border border-blue-500 text-white rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </button>
                </div>
              </div>

              {selectedOrder.payment && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Payment Details
                  </h4>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-white">
                      Method: {selectedOrder.payment.paymentMethod}
                    </p>
                    {selectedOrder.payment.transactionId && (
                      <p className="text-sm text-white mt-2">
                        Transaction ID: {selectedOrder.payment.transactionId}
                      </p>
                    )}
                    {selectedOrder.payment.bankAccount && (
                      <p className="text-sm text-white mt-2">
                        Bank Account: {selectedOrder.payment.bankAccount}
                      </p>
                    )}
                    {selectedOrder.payment.bankName && (
                      <p className="text-sm text-white mt-2">
                        Bank Name: {selectedOrder.payment.bankName}
                      </p>
                    )}
                    <p className="text-sm text-white mt-2">
                      Status: {selectedOrder.payment.status}
                    </p>
                    {selectedOrder.payment.paymentProof &&
                      selectedOrder.payment.paymentMethod !== "cod" && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-2">
                            Payment Proof:
                          </p>
                          <button
                            onClick={() => setShowPaymentProof(true)}
                            className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                          >
                            View Screenshot
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-700/50 rounded-xl gap-3"
                    >
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/48x64")
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {item.product?.name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity}
                          </p>
                          {item.product?.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(item.product.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={cancelDelete}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-red-500/40 rounded-2xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Delete Order</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Confirm deletion</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                  Are you sure you want to permanently delete this order from the database?
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-400 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-red-300 text-xs sm:text-sm font-medium leading-relaxed">
                      This action cannot be undone. All order data, items, and payment records will be permanently removed from the database.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Buttons */}
            <div className="bg-gray-800/30 border-t border-gray-700/50 px-6 py-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-5 py-3 bg-gray-700/50 hover:bg-gray-700 active:bg-gray-600 border border-gray-600/50 rounded-xl text-white text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 border border-red-500 rounded-xl text-white text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-red-500/25"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="hidden sm:inline">Delete Permanently</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;