import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { toast } from "react-toastify";

const ProductItems = ({
  id,
  image,
  name,
  price,
  originalPrice,
  category,
  bestseller,
  sizes,
}) => {
  const { currency, addToCart, toggleWishlistItem, isInWishlist } =
    useContext(ShopContext);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(sizes?.[0] || null);

  useEffect(() => {
    setIsWishlisted(isInWishlist(id));
  }, [id, isInWishlist]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);

    if (sizes?.length && !selectedFormat) {
      toast.error("Please select a format");
      setIsAddingToCart(false);
      return;
    }

    const success = await addToCart(id, selectedFormat, 1);
    if (success) {
      toast.success(
        <div>
          Added to cart: <span className="font-semibold">{name}</span>
          {selectedFormat && (
            <span className="text-gray-600"> ({selectedFormat})</span>
          )}
        </div>
      );
      setTimeout(() => setIsAddingToCart(false), 1000);
    } else {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await toggleWishlistItem(id);
    if (success) {
      setIsWishlisted(!isWishlisted);
      toast.success(
        isWishlisted
          ? `Removed ${name} from wishlist`
          : `Added ${name} to wishlist`
      );
    }
  };

  const handleImageError = (e) => {
    if (e.target.src !== "https://placehold.co/300x300?text=Book+Image") {
      e.target.src = "https://placehold.co/300x300?text=Book+Image";
      e.target.onerror = null;
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, y: -5, transition: { duration: 0.3 } },
  };

  const CardContent = (
    <>
      <div className="relative">
        <img
          className="w-full h-40 sm:h-56 object-cover rounded-t-2xl"
          src={image || "https://placehold.co/300x300?text=Book+Image"}
          alt={name}
          onError={handleImageError}
          loading="lazy"
        />
        {bestseller && (
          <span className="absolute top-2 left-2 bg-[#00308F] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
            Bestseller
          </span>
        )}

        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-colors duration-300 ${
            isWishlisted
              ? "bg-red-500 text-white shadow-md"
              : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-500"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart
            className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
          />
        </button>
      </div>

      <div className="p-3 sm:p-4 flex flex-col h-auto">
        <p className="text-xs text-gray-500 capitalize truncate">{category}</p>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1 overflow-hidden text-ellipsis max-w-full mt-1">
          {name}
        </h3>

        {/* Price display with original price if available */}
        <div className="flex items-center space-x-1 mt-1 shrink-0 max-w-full overflow-hidden">
          <p className="text-xs font-semibold text-[#00308F] whitespace-nowrap">
            {`${currency}${price.toFixed(2)}`}
          </p>
          {originalPrice && originalPrice > price && (
            <p className="text-xs text-gray-500 line-through whitespace-nowrap">
              {`${currency}${originalPrice.toFixed(2)}`}
            </p>
          )}
        </div>

        {/* Formats */}
        {sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
            {sizes.map((format) => (
              <button
                key={format}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedFormat(format);
                }}
                className={`px-2 py-1 text-xs rounded-full transition-all duration-200 ${
                  selectedFormat === format
                    ? "bg-[#00308F] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        )}

        {/* Add to Cart button */}
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          disabled={isAddingToCart}
          className={`w-full mt-3 py-2 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-300 ${
            isAddingToCart
              ? "bg-green-100 text-green-800"
              : "bg-[#00308F] hover:bg-[#002570] text-white"
          }`}
          aria-label={isAddingToCart ? "Added to cart" : "Add to cart"}
        >
          {isAddingToCart ? (
            "Added!"
          ) : (
            <>
              <FiShoppingCart className="w-3 h-3 inline-block mr-1" />
              <span>Add to Cart</span>
            </>
          )}
        </motion.button>
      </div>
    </>
  );

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover="hover"
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <Link
        to={`/product/${id}`}
        className="block text-gray-800 cursor-pointer focus:outline-none rounded-2xl"
        aria-label={`View details for ${name}`}
      >
        {CardContent}
      </Link>
    </motion.div>
  );
};

export default ProductItems;
