import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import Title from "../components/Title";

const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: "linear-gradient(to right, #e0f2fe, #ffedd5, #fecaca)", // Page background
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <Title text1="PRIVACY" text2="POLICY" />
        </div>

        {/* Content with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column - Policy Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-6 sm:p-8"
          >
            <section className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Introduction
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We are committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you visit our website or use our services.
                Please read this policy carefully.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We may collect personal information such as your name, email
                address, phone number, and shipping address when you register,
                place an order, or interact with our services. We also collect
                non-personal information like browsing behavior and IP
                addresses.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                How We Use Your Information
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Your information is used to process orders, improve our
                services, personalize your experience, and communicate with you.
                We may also use it for marketing purposes, with your consent, or
                to comply with legal obligations.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Sharing Your Information
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We do not sell or rent your personal information. We may share
                it with trusted third parties (e.g., payment processors, shipping
                providers) to fulfill orders or as required by law.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Your Rights
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                You have the right to access, update, or delete your personal
                information. You may also opt out of marketing communications or
                request information about how your data is used. Contact us to
                exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy, please contact
                us at{" "}
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

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center lg:justify-center items-center"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 max-w-sm">
              <img
                src={assets.about}
                alt="About Privacy"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
