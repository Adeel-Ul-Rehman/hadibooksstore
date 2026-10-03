import React, { useState } from "react";
import Title from "./Title";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const NewsLetterBox = () => {
  const [email, setEmail] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
      toast.success("Welcome to our reading circle! You're subscribed.");
      setEmail("");
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#16171b] border border-stone-200/90 dark:border-stone-800 p-8 sm:p-12 text-center shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)]"
      >
        {/* Subtle Warm Atmospheric Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-stone-300/20 dark:bg-stone-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto">
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-3.5 py-1 rounded-full mb-4">
            Curated Correspondence
          </span>

          <Title text1="LITERARY" text2="DISPATCHES" />

          <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans-clean">
            Receive early access to rare editions, seasonal curations, author spotlights, and collector discounts.
          </p>

          <form
            onSubmit={onSubmitHandler}
            className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto"
            role="form"
            aria-labelledby="newsletter-title"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full sm:flex-1 py-3 px-5 rounded-full border border-stone-300 dark:border-stone-700 bg-[#faf7f2] dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-150 shadow-inner"
              aria-label="Email address"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto py-3 px-7 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium rounded-full text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer active:scale-95"
              aria-label="Subscribe to newsletter"
            > 
              Join
            </button>
          </form>

          <p className="mt-4 text-[11px] text-stone-400 dark:text-stone-500">
            No spam, ever. Unsubscribe anytime with a single click.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsLetterBox;