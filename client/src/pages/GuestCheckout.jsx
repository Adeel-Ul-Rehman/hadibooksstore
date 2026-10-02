import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FiMapPin, FiCreditCard, FiTruck } from "react-icons/fi";
import { toast } from "react-toastify";
import validator from "validator";

const GuestCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { apiRequest, uploadGuestPaymentProof } = useContext(AppContext);
  const { cartItems, products, fetchCart, calculateCheckout, currency, SHIPPING_FEE, TAX_RATE } = useContext(ShopContext);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postCode, setPostCode] = useState("");
  const [country, setCountry] = useState("Pakistan"); // Default to Pakistan
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [onlinePaymentOption, setOnlinePaymentOption] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [showOnlinePaymentModal, setShowOnlinePaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [totals, setTotals] = useState({ subtotal: 0, taxes: 0, shippingFee: SHIPPING_FEE || 0, total: 0, items: [] });

  useEffect(() => {
    // calculate totals from server if possible
    const items = cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));
    const calculate = async () => {
      if (items.length === 0) return;
      try {
        const result = await calculateCheckout(items);
        if (result.success) {
          setTotals({ 
            subtotal: result.subtotal, 
            taxes: result.taxes, 
            shippingFee: result.shippingFee, 
            total: result.total, 
            items: result.items 
          });
          return;
        }
      } catch (e) {
        console.log("Using fallback calculation:", e);
      }

      // fallback local calculation
      const localItems = cartItems.map((ci) => ({
        ...ci,
        price: Number(ci.price || products.find((p) => p.id === ci.productId)?.price || 0),
      }));
      const subtotal = localItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const taxes = subtotal * (TAX_RATE || 0);
      const shippingFee = SHIPPING_FEE || 0;
      setTotals({ 
        subtotal, 
        taxes, 
        shippingFee, 
        total: subtotal + taxes + shippingFee, 
        items: localItems 
      });
    };
    calculate();
  }, [cartItems, products, calculateCheckout, SHIPPING_FEE, TAX_RATE]);

  useEffect(() => {
    // protect route: if cart empty redirect to cart
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const validate = () => {
    const e = {};
    if (!guestName?.trim()) e.guestName = "Full name is required";
    if (!guestEmail?.trim() || !validator.isEmail(guestEmail)) e.guestEmail = "Valid email is required";
    if (!guestPhone?.trim()) e.guestPhone = "Phone number is required";
    if (!address?.trim()) e.address = "Address is required";
    if (!city?.trim()) e.city = "City is required";
    if (!country?.trim()) e.country = "Country is required";
    // postCode is optional - not validated
    // if paying online, require an online payment option and proof
    if (paymentMethod === "online") {
      if (!onlinePaymentOption) e.onlinePaymentOption = "Please select a payment option";
      if (!paymentProof) e.paymentProof = "Payment proof is required for online payments";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildItemsPayload = () =>
    cartItems.map((ci) => ({ 
      productId: ci.productId, 
      quantity: ci.quantity, 
      price: Number(ci.price || products.find((p) => p.id === ci.productId)?.price || 0) 
    }));

  const handlePlaceOrder = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      // Show specific validation errors
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        errorMessages.forEach((msg, index) => {
          setTimeout(() => {
            toast.error(msg, { position: "top-center", autoClose: 4000 });
          }, index * 100); // Stagger toasts slightly
        });
      }
      return;
    }

    const items = buildItemsPayload();
    if (!items || items.length === 0) {
      toast.error("Your cart is empty", { position: "top-center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone.trim(), // Required now
        shippingAddress: address.trim(),
        city: city.trim(), // Required
        postCode: postCode?.trim() || "N/A", // Default to "N/A" if empty
        country: country.trim(), // Required
        items,
        totalPrice: totals.total,
        paymentMethod: paymentMethod, // 'cod' or 'online'
        onlinePaymentOption: paymentMethod === "online" ? onlinePaymentOption : undefined,
        taxes: totals.taxes,
        shippingFee: totals.shippingFee,
      };

      console.log("📦 Guest order payload:", payload);

      const data = await apiRequest("post", "/api/orders/guest-create", payload);
      
      if (data.success) {
        console.log("✅ Guest order created:", data.order.id);
        toast.success("Order placed successfully. Confirmation sent to your email.", { position: "top-center" });
        
        // Clear local cart
        try {
          localStorage.removeItem("localCart");
          setCartItems([]);
        } catch (e) {
          console.error("Error clearing local cart:", e);
        }

        // If payment method is online and proof exists, upload proof
        if (paymentMethod === "online" && paymentProof) {
          try {
            console.log("📤 Uploading payment proof...");
            const uploadRes = await uploadGuestPaymentProof(data.order.id, guestEmail, paymentProof);
            if (uploadRes.success) {
              toast.success('Payment proof uploaded. Admin will verify shortly.', { position: 'top-center' });
            } else {
              console.warn("Payment proof upload failed:", uploadRes.message);
              toast.warning('Order placed but payment proof upload failed. Please contact support.', { position: 'top-center' });
            }
          } catch (err) {
            console.error('Guest upload proof error', err);
            toast.warning('Order placed but payment proof upload failed. Please contact support.', { position: 'top-center' });
          }
        }

        navigate("/");
      } else {
        console.error("❌ Guest order failed:", data.message);
        // Show specific error message from backend
        toast.error(data.message || "Failed to place order", { position: "top-center", autoClose: 4000 });
      }
    } catch (err) {
      console.error("❌ Guest order error:", err);
      // Show specific error message from backend or network error
      const errorMessage = err.response?.data?.message || "Network error. Please check your connection and try again.";
      toast.error(errorMessage, { position: "top-center", autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setPaymentProof(null);
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(file.name.toLowerCase());
    const mimetype = filetypes.test(file.type);
    if (!extname || !mimetype) {
      toast.error('Please upload an image (jpeg, jpg, png, or webp)', { position: 'top-center' });
      setPaymentProof(null);
      return;
    }
    if (file.size > 250 * 1024) {
      toast.error('File size must be less than 250KB', { position: 'top-center' });
      setPaymentProof(null);
      return;
    }
    setPaymentProof(file);
    setErrors((prev) => ({ ...prev, paymentProof: '' }));
  };

  const handlePaymentMethodChange = (value) => {
    if (value === 'online') {
      setShowOnlinePaymentModal(true);
    } else {
      setPaymentMethod('cod');
      setOnlinePaymentOption('');
      setPaymentProof(null);
      setShowOnlinePaymentModal(false);
    }
  };

  const handleOnlinePaymentModalClose = (confirm) => {
    if (!confirm) {
      setPaymentMethod('cod');
      setOnlinePaymentOption('');
      setPaymentProof(null);
    } else {
      setPaymentMethod('online');
    }
    setShowOnlinePaymentModal(false);
  };

  const getImageUrl = (item) => {
    if (!item) return "https://placehold.co/300x300?text=Book+Image";
    if (item.image) return item.image;
    if (item.product?.image) return item.product.image;
    return "https://placehold.co/300x300?text=Book+Image";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto">
        <Title text1="GUEST" text2="CHECKOUT" />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg p-6 h-fit md:sticky md:top-6 md:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {totals.items && totals.items.length > 0 ? (
                totals.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <img src={getImageUrl(item)} alt={item.name || item.product?.name} className="w-12 h-12 object-cover rounded-xl" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name || item.product?.name || "Product"}</p>
                      <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#00308F]">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No items in cart.</p>
              )}

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{currency}{(totals.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{currency}{(totals.taxes || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{currency}{(totals.shippingFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg mt-2">
                  <span>Total</span>
                  <span>{currency}{(totals.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Info & Payment */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FiMapPin className="text-red-500" /> Shipping Information</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)} 
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                      placeholder="Enter your full name"
                    />
                    {errors.guestName && <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                    <input 
                      type="email" 
                      value={guestEmail} 
                      onChange={(e) => setGuestEmail(e.target.value)} 
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                      placeholder="your@email.com"
                    />
                    {errors.guestEmail && <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-600">*</span></label>
                    <input 
                      type="tel" 
                      value={guestPhone} 
                      onChange={(e) => setGuestPhone(e.target.value)} 
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                      placeholder="0300 1234567"
                      required
                    />
                    {errors.guestPhone && <p className="text-red-500 text-sm mt-1">{errors.guestPhone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country <span className="text-red-600">*</span></label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" required>
                      <option value="">Select Country</option>
                      <option value="Pakistan">Pakistan</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-600">*</span></label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                    placeholder="Full shipping address"
                    required
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                      placeholder="City"
                      required
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code <span className="text-gray-400 text-sm">(optional)</span></label>
                    <input 
                      type="text" 
                      value={postCode} 
                      onChange={(e) => setPostCode(e.target.value)} 
                      className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                      placeholder="Postal code"
                    />
                  </div>
                  <div />
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 mt-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FiCreditCard className="text-red-500" /> Payment Method</h2>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="cod" 
                          checked={paymentMethod === "cod"} 
                          onChange={() => handlePaymentMethodChange('cod')} 
                          className="form-radio text-red-500" 
                        />
                        <span className="text-gray-700 text-sm sm:text-base">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="online" 
                          checked={paymentMethod === "online"} 
                          onChange={() => handlePaymentMethodChange('online')} 
                          className="form-radio text-red-500" 
                        />
                        <span className="text-gray-700 text-sm sm:text-base">Pay Online</span>
                      </label>
                    </div>

                    {paymentMethod === "online" && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Select Payment Option</label>
                          <select 
                            value={onlinePaymentOption} 
                            onChange={(e) => setOnlinePaymentOption(e.target.value)} 
                            className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select a payment option</option>
                            <option value="JazzCash">JazzCash</option>
                            <option value="EasyPaisa">EasyPaisa</option>
                            <option value="BankTransfer">Bank Transfer</option>
                          </select>
                          {errors.onlinePaymentOption && <p className="text-red-500 text-sm mt-1">{errors.onlinePaymentOption}</p>}
                        </div>
                        <div className="space-y-4">
                          {onlinePaymentOption === 'JazzCash' && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <h3 className="text-lg font-semibold text-gray-800">JazzCash Payment</h3>
                              <p className="text-sm text-gray-700">Pay to: <span className="font-bold">Adeel Rehman</span><br/>Mobile Number: <span className="font-bold">03090005634</span><br/><span className="text-red-600 font-semibold">Ensure the payment is sent to the correct number.</span></p>
                            </div>
                          )}
                          {onlinePaymentOption === 'EasyPaisa' && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <h3 className="text-lg font-semibold text-gray-800">EasyPaisa Payment</h3>
                              <p className="text-sm text-gray-700">Pay to: <span className="font-bold">Adeel Rehman</span><br/>Mobile Number: <span className="font-bold">03090005634</span><br/><span className="text-red-600 font-semibold">Ensure the payment is sent to the correct number.</span></p>
                            </div>
                          )}
                          {onlinePaymentOption === 'BankTransfer' && (
                            <div className="p-4 bg-gray-50 rounded-xl">
                              <h3 className="text-lg font-semibold text-gray-800">Bank Transfer</h3>
                              <p className="text-sm text-gray-700">Pay to: <span className="font-bold">Adeel Rehman</span><br/>IBAN: <span className="font-bold">PK11JSBL9999903090005634</span><br/>Bank: <span className="font-bold">JS Bank</span><br/><span className="text-red-600 font-semibold">Ensure the payment is sent to the correct IBAN.</span></p>
                            </div>
                          )}

                          <div>
                            <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700">Upload Payment Proof</label>
                            <input 
                              id="paymentProof" 
                              type="file" 
                              accept="image/jpeg,image/jpg,image/png,image/webp" 
                              onChange={handleFileChange} 
                              className="mt-1 w-full py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500" 
                            />
                            {errors.paymentProof && <p className="text-red-500 text-sm mt-1">{errors.paymentProof}</p>}
                            <p className="text-sm text-gray-600 mt-2">Upload a clear screenshot of your payment confirmation (jpeg, jpg, png, or webp, max 250KB). Admin will verify and update the order status after verification.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online payment notice modal */}
                {showOnlinePaymentModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-4">
                      <h3 className="text-lg font-semibold mb-2">Online Payment</h3>
                      <p className="text-sm text-gray-700">We will bring a proper online payment system very soon! Until then, please use the manual payment methods provided below.</p>
                      <div className="mt-4 flex justify-end gap-2">
                        <button 
                          onClick={() => handleOnlinePaymentModalClose(false)} 
                          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleOnlinePaymentModalClose(true)} 
                          className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                        >
                          Proceed
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-2xl hover:from-red-500 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTruck /> 
                  {isSubmitting ? "Processing..." : "Place Order as Guest"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuestCheckout;