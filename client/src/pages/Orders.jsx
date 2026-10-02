import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { AppContext } from "../context/AppContext";
import Title from "../components/Title";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCheckSquare,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiCopy,
} from "react-icons/fi";

const Orders = () => {
  const { products, currency } = useContext(ShopContext);
  const { isLoading, user, apiRequest } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      fetchOrders();
    }
  }, [user, isLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("get", `/api/orders/get`);
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      setOrders([]);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-600 text-lg sm:text-xl" />;
      case "confirmed":
        return <FiCheckSquare className="text-blue-600 text-lg sm:text-xl" />;
      case "processing":
        return <FiBox className="text-indigo-600 text-lg sm:text-xl" />;
      case "ready_for_shipment":
        return <FiPackage className="text-purple-600 text-lg sm:text-xl" />;
      case "shipped":
        return <FiTruck className="text-teal-600 text-lg sm:text-xl" />;
      case "out_for_delivery":
        return (
          <FiShoppingCart className="text-orange-600 text-lg sm:text-xl" />
        );
      case "delivered":
        return <FiCheckCircle className="text-green-600 text-lg sm:text-xl" />;
      case "cancelled":
        return <FiXCircle className="text-red-600 text-lg sm:text-xl" />;
      case "refunded":
        return <FiDollarSign className="text-pink-600 text-lg sm:text-xl" />;
      case "partially_refunded":
        return <FiDollarSign className="text-pink-400 text-lg sm:text-xl" />;
      default:
        return <FiPackage className="text-gray-600 text-lg sm:text-xl" />;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "pending":
        return "Your order is pending confirmation.";
      case "confirmed":
        return "Your order has been confirmed.";
      case "processing":
        return "Your order is being processed.";
      case "ready_for_shipment":
        return "Your order is ready for shipment.";
      case "shipped":
        return "Your order has been shipped.";
      case "out_for_delivery":
        return "Your order is out for delivery.";
      case "delivered":
        return "Your order has been delivered.";
      case "cancelled":
        return "Your order has been cancelled.";
      case "refunded":
        return "Your order has been refunded.";
      case "partially_refunded":
        return "Your order has been partially refunded.";
      default:
        return "Your order status is unknown.";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "ready_for_shipment":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-teal-100 text-teal-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-pink-100 text-pink-800";
      case "partially_refunded":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShipmentInfo = (method) => {
    switch (method) {
      case "tcs":
        return {
          name: "TCS",
          link: "https://www.tcsexpress.com/track/",
          guidance:
            "Visit the TCS website and enter your tracking ID to monitor your shipment.",
        };
      case "leopard":
        return {
          name: "Leopard",
          link: "https://www.leopardscourier.com/tracking",
          guidance:
            "Visit the Leopard website and enter your tracking ID to monitor your shipment.",
        };
      case "trax":
        return {
          name: "Trax",
          link: "https://trax.pk/tracking/",
          guidance:
            "Visit the Trax website and enter your tracking ID to monitor your shipment.",
        };
      case "postex":
        return {
          name: "PostEx",
          link: "https://postex.pk/tracking",
          guidance:
            "Visit the PostEx website and enter your tracking ID to monitor your shipment.",
        };
      case "pakistan_post":
        return {
          name: "Pakistan Post",
          link: "https://ep.gov.pk/track.asp",
          guidance:
            "Visit the Pakistan Post website and enter your tracking ID to monitor your shipment.",
        };
      case "other":
        return {
          name: "Other",
          link: "",
          guidance:
            "Contact support for tracking details as this shipment uses a custom method.",
        };
      default:
        return {
          name: "Unknown",
          link: "",
          guidance:
            "No tracking information available. Please contact support.",
        };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Tracking ID copied to clipboard!"))
      .catch(() => toast.error("Failed to copy tracking ID."));
  };

  const handleTrackOrderClick = (order) => {
    if (order.trackingId && order.shippingMethod) {
      setSelectedTrackingOrder(order);
    } else {
      toast.info("Tracking ID has not been added yet.", {
        position: "top-center",
      });
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8 text-center"
      >
        <Title text1="YOUR" text2="ORDERS" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="inline-flex items-center justify-center">
            <svg
              className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-[#00308F]"
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
            <span className="ml-3 text-gray-700 text-base sm:text-lg font-medium">
              Loading...
            </span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8 text-center"
      >
        <Title text1="YOUR" text2="ORDERS" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-md p-6 max-w-md mx-auto"
        >
          <svg
            className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">
            Please Log In
          </h3>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            You need to log in or register to view your orders.
          </p>
          <div className="mt-4 flex gap-4 justify-center">
            <Link
              to="/login?redirect=/orders"
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-full shadow-md hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Log In
            </Link>
            <Link
              to="/register?redirect=/orders"
              className="px-4 py-2 sm:px-6 sm:py-3 bg-[#00308F] text-white font-semibold rounded-full shadow-md hover:bg-[#002266] transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Register
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <Title text1="YOUR" text2="ORDERS" />

        {loading ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-8"
          >
            <div className="inline-flex items-center justify-center">
              <svg
                className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-[#00308F]"
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
              <span className="ml-3 text-gray-700 text-base sm:text-lg font-medium">
                Loading orders...
              </span>
            </div>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-8 bg-white rounded-xl shadow-md p-6 max-w-md mx-auto"
          >
            <svg
              className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">
              No Orders Yet
            </h3>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              You haven't placed any orders yet. Start exploring our
              collections!
            </p>
            <Link
              to="/collections"
              className="mt-4 inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-full shadow-md hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="mt-8 space-y-4"
          >
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <h3 className="text-base font-bold text-[#00308F] tracking-tight">
                        Order #{order.id}
                      </h3>
                    </div>
                    <span
                      className={`mt-2 sm:mt-0 text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p
                    className={`text-sm ${
                      getStatusColor(order.status).split(" ")[1]
                    }`}
                  >
                    {getStatusDescription(order.status)}
                  </p>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-gray-600 mt-2">
                      Estimated Delivery:{" "}
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                  {order.trackingId && (
                    <p className="text-sm text-gray-600 mt-2">
                      Tracking ID: {order.trackingId}
                    </p>
                  )}
                  <div className="space-y-3 mt-4">
                    {order.items.slice(0, 2).map((item, i) => {
                      const product =
                        products.find((p) => p.id === item.productId) ||
                        item.product;
                      if (!product) return null;
                      const imageSrc = Array.isArray(item.product.image)
                        ? item.product.image[0]
                        : item.product.image || "/placeholder-image.jpg";
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-[#00308F] ml-auto">
                            {currency}
                            {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      Total: {currency}
                      {order.totalPrice.toFixed(2)}
                    </p>
                    <div className="mt-4 flex flex-row gap-2 w-full flex-nowrap justify-center sm:justify-end">
                      <button
                        onClick={() =>
                          navigate(
                            `/product/${order.items[0]?.productId || ""}`
                          )
                        }
                        className="px-2 py-1 sm:px-4 sm:py-2 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                        aria-label={`Buy again for order ${order.id}`}
                      >
                        Buy Again
                      </button>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                        aria-label={`View details for order ${order.id}`}
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleTrackOrderClick(order)}
                        className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold rounded-lg shadow-sm hover:from-blue-500 hover:to-blue-700 transition-all duration-300 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                        aria-label={`View tracking for order ${order.id}`}
                      >
                        Order Track Id
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Transition.Root show={!!selectedOrder} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedOrder(null)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
                  {selectedOrder && (
                    <>
                      <Dialog.Title className="text-lg font-bold text-[#00308F] mb-4">
                        Order #{selectedOrder.id}
                      </Dialog.Title>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">
                            Status:
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                              selectedOrder.status
                            )}`}
                          >
                            {selectedOrder.status
                              .replace(/_/g, " ")
                              .toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Order Date:{" "}
                          {new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString()}
                        </p>
                        <p
                          className={`text-sm ${
                            getStatusColor(selectedOrder.status).split(" ")[1]
                          }`}
                        >
                          {getStatusDescription(selectedOrder.status)}
                        </p>
                        {selectedOrder.estimatedDelivery && (
                          <p className="text-sm text-gray-600">
                            Estimated Delivery:{" "}
                            {new Date(
                              selectedOrder.estimatedDelivery
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {selectedOrder.trackingId && (
                          <p className="text-sm text-gray-600">
                            Tracking ID: {selectedOrder.trackingId}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Shipping Address: {selectedOrder.shippingAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment Method:{" "}
                          {selectedOrder.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Credit/Debit Card"}
                        </p>
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm text-gray-900 mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {selectedOrder.items.map((item, index) => {
                              const product =
                                products.find((p) => p.id === item.productId) ||
                                item.product;
                              if (!product) return null;
                              const imageSrc = Array.isArray(product.image)
                                ? product.image[0]
                                : product.image || "/placeholder-image.jpg";
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-3"
                                >
                                  <img
                                    src={imageSrc}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = "/placeholder-image.jpg";
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Quantity: {item.quantity} | {currency}
                                      {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-[#00308F]">
                                    {currency}
                                    {(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-600">
                              Total:
                            </p>
                            <p className="text-lg font-bold text-[#00308F]">
                              {currency}
                              {selectedOrder.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full py-2 px-4 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-sm"
                            aria-label="Close order details"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={!!selectedTrackingOrder} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedTrackingOrder(null)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
                  {selectedTrackingOrder && (
                    <>
                      <Dialog.Title className="text-lg font-bold text-[#00308F] mb-4">
                        Tracking Details for Order #{selectedTrackingOrder.id}
                      </Dialog.Title>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">
                            Tracking ID:
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#00308F] font-semibold">
                              {selectedTrackingOrder.trackingId}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  selectedTrackingOrder.trackingId
                                )
                              }
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-300"
                              aria-label="Copy tracking ID"
                            >
                              <FiCopy className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600">
                            Shipment Method:
                          </p>
                          <span className="text-sm text-[#00308F] font-semibold">
                            {
                              getShipmentInfo(
                                selectedTrackingOrder.shippingMethod
                              ).name
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {
                            getShipmentInfo(
                              selectedTrackingOrder.shippingMethod
                            ).guidance
                          }
                        </p>
                        {getShipmentInfo(selectedTrackingOrder.shippingMethod)
                          .link && (
                          <a
                            href={
                              getShipmentInfo(
                                selectedTrackingOrder.shippingMethod
                              ).link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-sm text-blue-600 hover:underline"
                          >
                            Go to{" "}
                            {
                              getShipmentInfo(
                                selectedTrackingOrder.shippingMethod
                              ).name
                            }{" "}
                            Tracking Page
                          </a>
                        )}
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => setSelectedTrackingOrder(null)}
                            className="w-full py-2 px-4 bg-[#00308F] text-white font-semibold rounded-lg shadow-sm hover:bg-[#002266] transition-all duration-300 cursor-pointer text-sm"
                            aria-label="Close tracking details"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </motion.div>
  );
};

export default Orders;
