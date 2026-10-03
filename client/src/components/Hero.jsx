import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { AppContext } from "../context/AppContext";

const Hero = () => {
  const { apiRequest } = useContext(AppContext);
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch hero images from backend
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const data = await apiRequest("get", "/api/hero/");
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setHeroImages(data.data);
        } else {
          setHeroImages([]);
        }
      } catch (error) {
        console.error("Fetch Hero Images Error:", error);
        setHeroImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, [apiRequest]);

  // Automatic image slide
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const fallbackImages = [
    {
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80&auto=format&fit=crop",
      altText: "Curated Classical Literature",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80&auto=format&fit=crop",
      altText: "Bestselling Books Collection",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80&auto=format&fit=crop",
      altText: "Academic and Fiction Editions",
    }
  ];

  const displayImages = heroImages.length > 0 ? heroImages : fallbackImages;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FAF7F2] via-[#F4EFEA] to-[#EAE2D8] dark:from-[#131417] dark:via-[#18191E] dark:to-[#111215] border-b border-[#EAE4DC] dark:border-[#26272F] transition-colors duration-200">
      {/* Subtle Warm Atmospheric Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/25 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-200/20 dark:bg-stone-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col text-center lg:text-left space-y-5 sm:space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Curated Editions & Timeless Literature
              </span>
            </div>

            {/* Editorial Heading */}
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 dark:text-stone-50 tracking-tight leading-[1.15]">
              Stories That Expand <br className="hidden sm:inline" />
              <span className="italic text-amber-800 dark:text-amber-400">
                Your Horizons.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Explore curated bestsellers, timeless classics, and hard-to-find secondhand gems. Every book is inspected for quality, packed with care, and delivered right to your doorstep.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4">
              <Link
                to="/collections"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white/60 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-semibold transition-all duration-200 cursor-pointer"
              >
                Our Story
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  New & Pre-loved
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Quality Guaranteed
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-amber-600 dark:text-amber-400 font-serif text-sm">★</span>
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  4.9/5 · 10k+ Readers
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Book Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glass Frame Container */}
              <div className="relative rounded-2xl p-2.5 sm:p-3 bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 backdrop-blur-md shadow-xl shadow-stone-900/5">
                <div className="relative w-full h-[280px] sm:h-[380px] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={displayImages[currentImageIndex]?.imageUrl || fallbackImages[0].imageUrl}
                        alt={displayImages[currentImageIndex]?.altText || "Featured Book Collection"}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        loading="eager"
                        onError={(e) => {
                          e.target.src = fallbackImages[0].imageUrl;
                        }}
                      />
                    </AnimatePresence>
                  )}

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Edition Tag */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                        Spotlight Edition
                      </p>
                      <p className="text-sm sm:text-base font-editorial font-medium truncate">
                        {displayImages[currentImageIndex]?.altText || "Curated Literary Works"}
                      </p>
                    </div>
                    {displayImages.length > 1 && (
                      <span className="text-xs bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-stone-200 font-mono">
                        {currentImageIndex + 1}/{displayImages.length}
                      </span>
                    )}
                  </div>

                  {/* Snappy Minimal Navigation Arrows */}
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 hover:bg-white text-stone-800 dark:text-stone-100 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform duration-150 active:scale-95 cursor-pointer z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 hover:bg-white text-stone-800 dark:text-stone-100 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform duration-150 active:scale-95 cursor-pointer z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;