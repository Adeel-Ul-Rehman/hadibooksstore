import React from 'react';
import Hero from '../components/Hero';
import LatestCollection from '../components/LatestCollection';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsLetterBox from '../components/NewsLetterBox';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100"
    >
      <div className="flex flex-col space-y-8 md:space-y-10 lg:space-y-12">
        <Hero />
        <div className="px-4 sm:px-6 lg:px-8">
          <LatestCollection />
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <BestSeller />
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <OurPolicy />
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <NewsLetterBox />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;  