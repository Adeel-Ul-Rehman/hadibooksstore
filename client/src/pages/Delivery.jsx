import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import Title from "../components/Title";

// Base64 placeholder image
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

const Delivery = () => {
  const shippingCompanies = [
    { name: "TCS", image: assets.tcs },
    { name: "Leopard", image: assets.leopard },
    { name: "Trax", image: assets.trax },
    { name: "PostEx", image: assets.postX },
    { name: "Pakistan Post", image: assets.pakPost },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: "linear-gradient(to right, #e0f2fe, #ffedd5, #fecaca)", // Gradient like Privacy page
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>

        {/* Delivery Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-6 sm:p-8"
        >
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Introduction
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We are committed to delivering your orders promptly and reliably...
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Shipping Methods
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We partner with leading courier services...
            </p>

            {/* Shipping Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 mt-6"
            >
              {shippingCompanies.map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <img
                    src={company.image}
                    alt={`${company.name} logo`}
                    className="h-14 w-14 object-contain rounded-md shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300 bg-white"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <p className="mt-2 text-xs sm:text-sm text-gray-700">
                    {company.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* The rest sections */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Delivery Timelines
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Orders are typically delivered within 4–7 business days...
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Shipping Costs
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              A flat shipping fee of 100 PKR is applied...
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Tracking Information
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Once your order is shipped, you will receive a tracking ID...
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Contact Us
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              For any questions, contact{" "}
              <a
                href="mailto:hadibooksstore01@gmail.com"
                className="text-blue-700 hover:text-blue-900 font-semibold transition-colors"
              >
                hadibooksstore01@gmail.com
              </a>
              .
            </p>
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Delivery;
