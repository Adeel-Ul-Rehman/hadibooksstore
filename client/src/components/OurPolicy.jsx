import React from "react";
import { assets } from "../assets/assets";
import Title from "./Title";
import { motion } from "framer-motion";

const OurPolicy = () => {
  const policies = [
    {
      icon: assets.exchange_icon,
      title: "Seamless Exchange",
      description: "Hassle-free exchanges within 7 days on all titles.",
      badge: "7-Day Window"
    },
    {
      icon: assets.quality_icon,
      title: "Guaranteed Authenticity",
      description: "100% genuine publisher prints, verified and pristine.",
      badge: "Quality Assured"
    },
    {
      icon: assets.support_img,
      title: "Dedicated Reader Support",
      description: "Expert assistance available 24/7 for all inquiries.",
      badge: "Always Available"
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <Title text1={"OUR"} text2={"PROMISE"} />
        <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-normal max-w-xl mx-auto tracking-wide">
          Curated literature backed by reader-first standards and reliable service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((policy, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.25, delay: index * 0.08, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col items-center text-center p-7 bg-white dark:bg-[#16171b] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_12px_-2px_rgba(28,25,23,0.03)] hover:shadow-lg hover:border-amber-600/30 dark:hover:border-amber-500/30 transition-all duration-200"
          >
            {/* Top Pill */}
            <span className="mb-5 text-[10px] uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-3 py-1 rounded-full">
              {policy.badge}
            </span>

            {/* Icon Container */}
            <div className="w-14 h-14 rounded-2xl bg-[#faf7f2] dark:bg-stone-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200 shadow-inner">
              <img
                src={policy.icon}
                alt={policy.title}
                className="w-7 h-7 object-contain opacity-90 group-hover:opacity-100"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23A1A1AA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                }}
              />
            </div>

            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
              {policy.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-sans-clean">
              {policy.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );  
};

export default OurPolicy;