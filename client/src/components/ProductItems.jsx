import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart, FiCheck } from "react-icons/fi";
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
            <span className="text-stone-500"> ({selectedFormat})</span>
          )}
        </div>
      );
      setTimeout(() => setIsAddingToCart(false), 900);
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
    if (e.target.src !== "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop") {
      e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop";
      e.target.onerror = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative bg-white dark:bg-[#18191E] rounded-xl border border-stone-200/90 dark:border-stone-800/90 overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5 flex flex-col h-full"
    >
      <Link
        to={`/product/${id}`}
        className="block flex-1 focus:outline-none"
        aria-label={`View details for ${name}`}
      >
        {/* Book Cover Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
          <img
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            src={image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop"}
            alt={name}
            onError={handleImageError}
            loading="lazy"
          />

          {/* Bestseller Badge */}
          {bestseller && (
            <span className="absolute top-2.5 left-2.5 bg-stone-900/90 dark:bg-stone-100/95 text-amber-300 dark:text-amber-900 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs border border-amber-400/20">
              Bestseller
            </span>
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-150 active:scale-90 cursor-pointer ${
              isWishlisted
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-white/85 dark:bg-stone-900/85 text-stone-600 dark:text-stone-300 hover:text-rose-500 hover:bg-white"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Book Info Body */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
              {category || "Literature"}
            </p>
            <h3 className="font-editorial text-sm sm:text-base font-normal text-stone-900 dark:text-stone-100 line-clamp-1 mt-1 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors duration-150">
              {name}
            </h3>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                {`${currency}${Number(price).toFixed(2)}`}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-stone-400 line-through">
                  {`${currency}${Number(originalPrice).toFixed(2)}`}
                </span>
              )}
            </div>

            {/* Formats Selection */}
            {sizes?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {sizes.map((format) => (
                  <button
                    key={format}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFormat(format);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors duration-150 ${
                      selectedFormat === format
                        ? "bg-amber-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`w-full mt-3.5 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
              isAddingToCart
                ? "bg-emerald-600 text-white"
                : "bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 shadow-xs hover:shadow-sm"
            }`}
            aria-label={isAddingToCart ? "Added to cart" : "Add to cart"}
          >
            {isAddingToCart ? (
              <>
                <FiCheck className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductItems;
