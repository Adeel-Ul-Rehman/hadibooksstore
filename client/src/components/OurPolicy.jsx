import React from "react";
import { assets } from "../assets/assets";
import Title from "./Title";
import { motion } from "framer-motion";

const OurPolicy = () => {
  const policies = [
    {
      icon: assets.exchange_icon,
      title: "Easy Exchange Policy",
      description: "Hassle-free exchanges within 7 days for your convenience.",
    },
    {
      icon: assets.quality_icon,
      title: "7 Days Return Policy",
      description: "Return products within 7 days for a full refund.",
    },
    {
      icon: assets.support_img,
      title: "Best Customer Support",
      description: "24/7 support to assist you with any queries.",
    },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, rotate: 2, transition: { duration: 0.3 } }
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
        <Title text1={"OUR"} text2={"POLICIES"} />
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mt-2 text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto italic tracking-wide"
        >
          Shop with confidence with our customer-focused policies.
        </motion.p>
      </div>
      <motion.div
        className="mt-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          visible: { transition: { staggerChildren: 0.2 } }
        }}
      >
        {policies.map((policy, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col items-center text-center p-4 sm:p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <img
              src={policy.icon}
              alt={policy.title}
              className="w-14 h-14 sm:w-16 sm:h-16 mb-4 hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23A1A1AA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
              }}
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              {policy.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 font-medium">
              {policy.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );  
};

export default OurPolicy;