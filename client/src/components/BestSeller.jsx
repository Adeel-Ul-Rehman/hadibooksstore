import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItems from './ProductItems';
import { motion } from 'framer-motion';
import { FiBook } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BestSeller = () => {
  const { products, loading } = useContext(ShopContext);
  const navigate = useNavigate();
  const bestSeller = products.filter(item => item.bestseller).slice(0, 6);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto text-center">
        <Title text1={'BEST'} text2={'SELLERS'} />
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mt-2 text-sm sm:text-base text-gray-600 font-medium font-['Poppins',sans-serif] max-w-2xl mx-auto italic tracking-wide"
        >
          Explore our top-selling books loved by readers and knowledge fans.
        </motion.p>
      </div>
      {loading ? (
        <div className="mt-8 flex justify-center items-center">
          <svg className="animate-spin h-12 w-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : bestSeller.length > 0 ? (
        <motion.div
          className="mt-6 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {bestSeller.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotate: -1, transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.95 }}
            >
              <ProductItems
                id={item.id}
                image={item.image}
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                category={item.category}
                bestseller={item.bestseller}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mt-6 max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100"
        >
          <FiBook className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">No Bestsellers Available</h3>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            No bestsellers available at the moment. Check out our collections!
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="mt-4 inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-sm sm:text-base"
          >
            Explore Collections
          </button>
        </motion.div>
      )}
    </motion.section>
  );
};

export default BestSeller;