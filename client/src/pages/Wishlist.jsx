import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Title from '../components/Title';

const Wishlist = () => {
  const { products, wishlistItems, removeFromWishlist, addToCart, getWishlistCount, user, loading, currency } = useContext(ShopContext);
  const navigate = useNavigate();

  const wishlistProducts = products.filter(product =>
    wishlistItems.some(item => item.productId === product.id)
  );

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId, null, 1);
    if (success) {
      toast.success('Added to cart');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const success = await removeFromWishlist(productId);
    if (success) {
      toast.info('Removed from wishlist');
      await fetchWishlist(); // Refresh wishlist after removal
    } else {
      toast.error('Failed to remove from wishlist');
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, rotate: 2, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 font-['Poppins',sans-serif]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-800 hover:text-[#00308F] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <Title text1="MY" text2="WISHLIST" />
          <div className="w-8"></div>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#00308F] rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-2">Loading wishlist...</p>
          </motion.div>
        )}

        {!loading && getWishlistCount() === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100"
          >
            <FiHeart className="mx-auto w-16 h-16 text-[#00308F] mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              There are no products in your wishlist
            </h3>
            <p className="text-gray-600 mb-6">
              Save your favorite books here to view them later
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="px-6 py-3 bg-[#00308F] text-white rounded-lg hover:bg-[#002570] transition-all duration-300 hover:shadow-lg"
            >
              Browse Collections
            </button>
          </motion.div>
        )}

        {!loading && getWishlistCount() > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <AnimatePresence>
              {wishlistProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  exit="exit"
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 min-h-[220px] sm:min-h-[260px] w-full flex flex-col"
                >
                  <div className="relative w-full h-40 sm:h-56">
                    <img
                      className="w-full h-full object-cover rounded-t-2xl"
                      src={product.image || 'https://placehold.co/300x300?text=Book+Image'}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Book+Image'; e.target.onerror = null; }}
                      loading="lazy"
                    />
                    {product.bestseller && (
                      <span className="absolute top-2 left-2 bg-[#00308F] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                        Bestseller
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-2 right-2 z-10 p-2 rounded-full transition-colors duration-300 bg-[#00308F] text-white shadow-md hover:bg-[#002570] hover:shadow-lg"
                      aria-label="Remove from wishlist"
                    >
                      <FiHeart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col p-3 sm:p-4">
                    <p className="text-xs text-gray-500 capitalize line-clamp-1 overflow-hidden text-ellipsis max-w-full">{product.category}</p>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1 overflow-hidden text-ellipsis max-w-full mt-1">{product.name}</h3>
                    <div className="flex items-center space-x-1 mt-1 shrink-0 max-w-full overflow-hidden">
                      <p className="text-xs font-semibold text-[#00308F] whitespace-nowrap">
                        {currency}{product.price.toFixed(2)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-500 line-through whitespace-nowrap">
                          {currency}{product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleAddToCart(product.id)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      className="w-full mt-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#00308F] hover:bg-[#002570] text-white transition-all duration-300 flex items-center justify-center"
                    >
                      <FiShoppingCart className="w-3 h-3 inline-block mr-1" />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Wishlist;