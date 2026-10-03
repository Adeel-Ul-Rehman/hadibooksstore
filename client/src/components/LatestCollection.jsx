import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItems from './ProductItems';
import { motion } from 'framer-motion';
import { FiBook, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LatestCollection = () => {
  const { products, loading } = useContext(ShopContext);
  const navigate = useNavigate();
  const latestProducts = products.slice(0, 12);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <Title text1={'LATEST'} text2={'ACQUISITIONS'} />
        <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-normal max-w-2xl mx-auto tracking-wide">
          Handpicked literature, fresh publications, and newly cataloged editions.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center items-center py-12">
          <div className="w-10 h-10 border-2 border-stone-300 dark:border-stone-700 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : latestProducts.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {latestProducts.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.2, delay: (index % 6) * 0.04, ease: "easeOut" }}
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
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/collections')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-xs uppercase tracking-widest font-semibold text-stone-800 dark:text-stone-200 hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-stone-900 transition-all duration-150 cursor-pointer shadow-xs"
            >
              <span>Explore Full Catalog</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 max-w-md mx-auto bg-white dark:bg-stone-900 rounded-2xl p-8 text-center border border-stone-200 dark:border-stone-800">
          <FiBook className="mx-auto h-12 w-12 text-stone-400" />
          <h3 className="mt-4 text-base font-serif font-bold text-stone-900 dark:text-stone-100">No Editions Available</h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Check back soon as new inventory is currently being cataloged.
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="mt-5 inline-block px-5 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            Browse Catalog
          </button>
        </div>
      )}
    </section>
  );
};

export default LatestCollection;