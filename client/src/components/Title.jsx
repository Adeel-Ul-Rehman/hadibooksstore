import React from "react";
import { motion } from "framer-motion";

const Title = ({ text1, text2 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8"
    >
      <div className="flex items-center gap-2 sm:gap-3 text-center">
        <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-stone-900 dark:text-stone-100">
          <span className="font-medium text-stone-800 dark:text-stone-200">{text1}</span>{" "}
          <span className="italic text-amber-700 dark:text-amber-500 font-serif">
            {text2}
          </span>
        </h2>
        <span className="hidden sm:inline-block w-10 sm:w-16 h-[2px] bg-gradient-to-r from-amber-600 to-transparent rounded-full self-center"></span>
      </div>
    </motion.div>
  );
};

export default Title;
