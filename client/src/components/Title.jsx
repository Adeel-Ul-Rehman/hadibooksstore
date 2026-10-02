import React from "react";
import { motion } from "framer-motion";

const Title = ({ text1, text2 }) => {
  // Animation variants for staggered effect
  const container = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const word = {
    hidden: { opacity: 0, y: 30, filter: "blur(5px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // triggers nicely on scroll
      variants={container}
      className="flex items-center justify-center gap-3 mb-6 flex-nowrap"
    >
      {/* Main Title */}
      <motion.h2
        variants={container}
        className="text-[#00308F] font-['Poppins',sans-serif] text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight whitespace-nowrap text-center flex gap-2"
      >
        {/* First word */}
        <motion.span variants={word}>{text1}</motion.span>

        {/* Second word with gradient */}
        <motion.span
          variants={word}
          className="bg-gradient-to-r from-red-500 via-red-500 to-orange-500 bg-clip-text text-transparent font-light"
        >
          {text2}
        </motion.span>
      </motion.h2>

      {/* Right-side Line */}
      <motion.span
        variants={word}
        className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gradient-to-r from-red-400 to-orange-500 rounded-full"
      ></motion.span>
    </motion.div>
  );
};

export default Title;
