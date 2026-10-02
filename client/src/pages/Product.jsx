import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import ProductItems from "../components/ProductItems";
import Review from "../components/Review";
import { motion } from "framer-motion";
import Title from "../components/Title";
import { FiHeart } from "react-icons/fi";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, toggleWishlistItem, isInWishlist } =
    useContext(ShopContext);
  const { apiRequest, user } = useContext(AppContext);
  const [productData, setProductData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeTab, setActiveTab] = useState("Description");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const data = await apiRequest("get", `/api/products/${productId}`);
        if (data.success) {
          setProductData(data.product);
          setSelectedFormat(data.product.sizes?.[0] || "");
        } else {
          setError(data.message || "Product not found");
          toast.error(data.message || "Product not found");
          navigate("/collections");
        }
      } catch (error) {
        console.error("Fetch Product Error:", error);
        setError("Failed to fetch product. Please try again later.");
        toast.error("Failed to fetch product");
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [productId, navigate, apiRequest]);

  // Fetch reviews for average rating and reviews tab
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(activeTab === "Reviews");
        const data = await apiRequest(
          "get",
          `/api/reviews/product/${productId}?page=${pagination.page}&limit=${pagination.limit}`
        );
        if (data.success) {
          setReviews(data.reviews);
          setPagination(data.pagination);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.pagination.total || 0);
        } else {
          setReviews([]);
          setAverageRating(0);
          setTotalReviews(0);
        }
      } catch (error) {
        console.error("Fetch Reviews Error:", error);
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [
    productId,
    activeTab,
    refreshReviews,
    pagination.page,
    pagination.limit,
    apiRequest,
  ]);

  // Handle format selection
  const handleFormatChange = (format) => {
    setSelectedFormat(format);
  };

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!productData) return;

    const success = await addToCart(productData.id, selectedFormat, quantity);
    if (success) {
      toast.success(
        <div>
          Added to cart:{" "}
          <span className="font-semibold">{productData.name}</span>
          {selectedFormat && (
            <span className="text-gray-800"> ({selectedFormat})</span>
          )}
        </div>
      );
    }
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = async () => {
    const success = await toggleWishlistItem(productData.id);
    if (success) {
      toast.success(
        isInWishlist(productData.id)
          ? "Removed from wishlist"
          : "Added to wishlist"
      );
    }
  };

  // Image zoom effect
  const handleImageHover = (e) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Trigger review refresh
  const triggerReviewRefresh = () => {
    setRefreshReviews((prev) => !prev);
  };

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100"
      >
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-800 mb-6">{error}</p>
          <button
            onClick={() => navigate("/collections")}
            className="px-6 py-3 bg-[#00308F] text-white rounded-lg hover:bg-[#002570] transition-colors"
          >
            Browse Collections
          </button>
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (loadingProduct) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100"
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#00308F] rounded-full animate-spin"></div>
          <p className="text-gray-800 mt-2">Loading product...</p>
        </div>
      </motion.div>
    );
  }

  // Ensure productData exists
  if (!productData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100"
      >
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-800 mb-6">
            The product you’re looking for is not available.
          </p>
          <button
            onClick={() => navigate("/collections")}
            className="px-6 py-3 bg-[#00308F] text-white rounded-lg hover:bg-[#002570] transition-colors"
          >
            Browse Collections
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 font-['Poppins',sans-serif]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 text-sm">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center text-gray-800 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001 1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <button
                  onClick={() => navigate("/collections")}
                  className="ml-1 text-gray-800 hover:text-gray-900 transition-colors"
                >
                  Collections
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-gray-800 truncate max-w-[150px] sm:max-w-[200px]">
                  {productData.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Image Display */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-gray-100 rounded-xl overflow-hidden"
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseMove={handleImageHover}
              >
                <img
                  src={
                    productData.image ||
                    "https://via.placeholder.com/300x300?text=Book+Image"
                  }
                  alt={productData.name}
                  className="w-full h-56 sm:h-64 lg:h-80 object-contain mx-auto transition-transform duration-300"
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          transform: "scale(1.5)",
                        }
                      : {}
                  }
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x300?text=Book+Image";
                  }}
                />
                {productData.bestseller && (
                  <div className="absolute top-2 left-2 bg-[#00308F] text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    BESTSELLER
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl font-medium text-gray-900"
              >
                {productData.name}
              </motion.h1>
              <div className="mt-1 flex items-center space-x-2 text-sm text-gray-800">
                <span className="capitalize">{productData.category}</span>
                {productData.subCategory && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="capitalize">
                      {productData.subCategory}
                    </span>
                  </>
                )}
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-800">
                {averageRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-1"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {currency}
                  {productData.price.toFixed(2)}
                </span>
                {productData.originalPrice && (
                  <span className="text-lg text-gray-600 line-through">
                    {currency}
                    {productData.originalPrice.toFixed(2)}
                  </span>
                )}
                {productData.discount && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
                    {productData.discount}% OFF
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="prose prose-sm max-w-none text-gray-800"
            >
              <p className="line-clamp-3">{productData.description}</p>
            </motion.div>

            {productData.sizes && productData.sizes.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-medium text-gray-900">Format</h3>
                <div className="flex flex-wrap gap-2">
                  {productData.sizes.map((format) => (
                    <motion.button
                      key={format}
                      onClick={() => handleFormatChange(format)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        selectedFormat === format
                          ? "bg-[#00308F] text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {format}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-2 pt-2"
            >
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
              <span className="text-sm text-gray-800">
                {quantity === 10 ? "Max quantity reached" : "Max 10 per order"}
              </span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-2 flex items-center space-x-2"
            >
              <button
                onClick={handleAddToCart}
                className="px-5 py-2 cursor-pointer bg-[#00308F] text-white font-semibold rounded-lg shadow-md hover:bg-[#002570] transition-all duration-300 hover:shadow-lg text-center"
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isInWishlist(productData.id)
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-400 border cursor-pointer border-gray-300 hover:bg-gray-200 hover:text-red-500"
                }`}
                aria-label={
                  isInWishlist(productData.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <FiHeart
                  className={`w-5 h-5 ${
                    isInWishlist(productData.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-100 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-start text-sm">
                <svg
                  className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Free Delivery</h4>
                  <p className="text-gray-800">
                    Available for most locations. Delivery in 3-5 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start text-sm">
                <svg
                  className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900">Easy Returns</h4>
                  <p className="text-gray-800">
                    7-day return policy. No questions asked.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-300">
            <nav className="flex space-x-6">
              <button
                onClick={() => handleTabChange("Description")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "Description"
                    ? "border-[#00308F] text-[#00308F]"
                    : "border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => handleTabChange("Specifications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "Specifications"
                    ? "border-[#00308F] text-[#00308F]"
                    : "border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => handleTabChange("Reviews")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "Reviews"
                    ? "border-[#00308F] text-[#00308F]"
                    : "border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Reviews ({totalReviews})
              </button>
            </nav>
          </div>
          <div className="py-4">
            {activeTab === "Description" && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-medium text-gray-900">
                  About this item
                </h3>
                <p className="text-gray-800">{productData.description}</p>
                {productData.details && (
                  <ul className="mt-2 space-y-1 text-gray-800">
                    {productData.details.split("\n").map((item, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === "Specifications" && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-medium text-gray-900">
                  Specifications
                </h3>
                <ul className="mt-2 space-y-1 text-gray-800">
                  <li>
                    <strong>Author:</strong> {productData.author}
                  </li>
                  {productData.isbn && (
                    <li>
                      <strong>ISBN:</strong> {productData.isbn}
                    </li>
                  )}
                  <li>
                    <strong>Language:</strong> {productData.language}
                  </li>
                  <li>
                    <strong>Publication Date:</strong>{" "}
                    {new Date(Number(productData.date)).toLocaleDateString()}
                  </li>
                  {productData.sizes && productData.sizes.length > 0 && (
                    <li>
                      <strong>Formats:</strong> {productData.sizes.join(", ")}
                    </li>
                  )}
                </ul>
              </div>
            )}
            {activeTab === "Reviews" && (
              <Review
                productId={productData.id}
                reviews={reviews}
                pagination={pagination}
                setPagination={setPagination}
                triggerReviewRefresh={triggerReviewRefresh}
                loadingReviews={loadingReviews}
                isAuthenticated={!!user}
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <div className="text-xl mb-6 text-center">
            <Title text1={"Related "} text2={"Products"} />
          </div>
          {products.filter(
            (item) =>
              item.category === productData.category &&
              item.id !== productData.id
          ).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products
                .filter(
                  (item) =>
                    item.category === productData.category &&
                    item.id !== productData.id
                )
                .slice(0, 5)
                .map((item) => (
                  <ProductItems
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    name={item.name}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    category={item.category}
                    bestseller={item.bestseller}
                  />
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-800">
              No related products available.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Product;
