import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import ProductItems from "../components/ProductItems";
import Title from "../components/Title";
import { motion, AnimatePresence } from "framer-motion";
import { FiBook, FiFilter, FiX, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";

const Collections = () => {
  const { products, currency } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    subCategory: [],
    priceRange: [0, 100],
    rating: null,
    availability: "all",
    searchQuery: "",
  });
  const [sortOption, setSortOption] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [mobileSectionOpen, setMobileSectionOpen] = useState({
    categories: false,
    subcategories: false,
    price: false,
    rating: false,
    availability: false,
  });
  const [reportBook, setReportBook] = useState({ name: "", description: "" });
  const location = useLocation();
  const navigate = useNavigate();

  // Fixed categories
  const fixedCategories = [
    "Govt School",
    "Private School",
    "College & University",
    "Competitive Exam",
    "Past Papers",
    "Religious & Spiritual",
    "Urdu Novels",
    "Urdu Poetry",
    "Urdu Literature",
    "English Novels",
    "English Literature",
    "Children & Young Reader",
    "Medical",
    "Engineering",
    "Business",
    "History",
    "General Interest",
    "Used & Affordable",
  ];

  // Clean and format subcategory strings
  const cleanSubCategory = (sub) => {
    if (!sub || typeof sub !== "string") return "";
    return sub
      .replace(/[\[\]\",]/g, "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Unique subcategories (excluding fixed categories, max 50)
  const uniqueSubCategories = [
    ...new Set(
      products
        .flatMap((p) => p.subCategories || [])
        .filter(
          (sub) => sub && !fixedCategories.includes(sub) && sub.trim() !== ""
        )
        .map(cleanSubCategory)
    ),
  ].slice(0, 50);

  // Compute subcategories per category (up to 20 per category)
  const subCategoriesByCategory = fixedCategories.reduce((acc, cat) => {
    acc[cat] =
      cat === "Used & Affordable"
        ? [
            ...new Set(
              products
                .flatMap((p) => p.subCategories || [])
                .filter(
                  (sub) =>
                    sub && !fixedCategories.includes(sub) && sub.trim() !== ""
                )
                .map(cleanSubCategory)
            ),
          ].slice(0, 20)
        : [
            ...new Set(
              products
                .filter((p) => p.category === cat)
                .flatMap((p) => p.subCategories || [])
                .filter(
                  (sub) =>
                    sub && !fixedCategories.includes(sub) && sub.trim() !== ""
                )
                .map(cleanSubCategory)
            ),
          ].slice(0, 20);
    return acc;
  }, {});

  // Calculate min and max prices
  const minPrice =
    products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  const maxPrice =
    products.length > 0 ? Math.max(...products.map((p) => p.price)) : 100;

  // Initialize price range
  useEffect(() => {
    if (products.length > 0) {
      setActiveFilters((prev) => ({
        ...prev,
        priceRange: [minPrice, maxPrice],
      }));
    }
  }, [products, minPrice, maxPrice]);

  // Check for search query in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setActiveFilters((prev) => ({
        ...prev,
        searchQuery: searchQuery,
      }));
    }
  }, [location.search]);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...products];

    if (activeFilters.searchQuery) {
      const query = activeFilters.searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.subCategories &&
            product.subCategories.some((sub) =>
              cleanSubCategory(sub).toLowerCase().includes(query)
            )) ||
          (product.description &&
            product.description.toLowerCase().includes(query))
      );
    }

    if (activeFilters.category.length > 0) {
      result = result.filter((product) =>
        activeFilters.category.includes(product.category)
      );
    }

    if (activeFilters.subCategory.length > 0) {
      result = result.filter(
        (product) =>
          product.subCategories &&
          product.subCategories.some((sub) =>
            activeFilters.subCategory.includes(cleanSubCategory(sub))
          )
      );
    }

    if (activeFilters.priceRange && activeFilters.priceRange.length === 2) {
      result = result.filter(
        (product) =>
          product.price >= activeFilters.priceRange[0] &&
          product.price <= activeFilters.priceRange[1]
      );
    }

    if (activeFilters.rating) {
      result = result.filter((product) => {
        const productRating = product.rating || 4;
        return productRating >= activeFilters.rating;
      });
    }

    if (activeFilters.availability === "in-stock") {
      result = result.filter((product) => product.inStock !== false);
    } else if (activeFilters.availability === "bestseller") {
      result = result.filter((product) => product.bestseller);
    }

    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - b.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "new-books":
        result = result.filter(
          (product) =>
            product.subCategories &&
            product.subCategories.some(
              (sub) => cleanSubCategory(sub) === "New Books"
            )
        );
        break;
      case "old-books":
        result = result.filter(
          (product) =>
            product.subCategories &&
            product.subCategories.some(
              (sub) => cleanSubCategory(sub) === "Old Books"
            )
        );
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, activeFilters, sortOption]);

  // Paginate products
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
    setPaginatedProducts(currentProducts);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Change page and scroll to top
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProducts.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Maximum number of page buttons to show
  const maxPageNumbers = 5;
  const getPageNumbersToShow = () => {
    if (pageNumbers.length <= maxPageNumbers) {
      return pageNumbers;
    }

    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    const endPage = Math.min(pageNumbers.length, startPage + maxPageNumbers - 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const toggleFilter = (filterType, value) => {
    setActiveFilters((prev) => {
      let updated;
      if (prev[filterType].includes(value)) {
        updated = {
          ...prev,
          [filterType]: prev[filterType].filter((item) => item !== value),
        };
      } else {
        updated = {
          ...prev,
          [filterType]: [...prev[filterType], value],
        };
      }
      toast.success("Filter applied!", { autoClose: 1200, position: "top-center" });
      return updated;
    });
  };

  const toggleSingleFilter = (filterType, value) => {
    setActiveFilters((prev) => {
      const updated = {
        ...prev,
        [filterType]: prev[filterType] === value ? null : value,
      };
      toast.success("Filter applied!", { autoClose: 1200, position: "top-center" });
      return updated;
    });
  };

  const handlePriceChange = (e, index) => {
    const value = parseInt(e.target.value);
    setActiveFilters((prev) => {
      const newRange = [...prev.priceRange];
      newRange[index] = value;
      toast.success("Filter applied!", { autoClose: 1200, position: "top-center" });
      return {
        ...prev,
        priceRange: newRange,
      };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      subCategory: [],
      priceRange: [minPrice, maxPrice],
      rating: null,
      availability: "all",
      searchQuery: "",
    });
    setSortOption("featured");
    navigate("/collections");
  };

  const handleCategoryHover = (category) => {
    setHoveredCategory(category);
  };

  const handleCategoryLeave = () => {
    setTimeout(() => {
      if (
        !document.querySelector(
          `.category-${fixedCategories.indexOf(hoveredCategory)}:hover`
        )
      ) {
        setHoveredCategory(null);
      }
    }, 2500);
  };

  const handleSubCategoryClick = (subCategory) => {
    setActiveFilters((prev) => {
      const updated = {
        ...prev,
        subCategory: [subCategory],
      };
      toast.success("Filter applied!", { autoClose: 1200, position: "top-center" });
      return updated;
    });
    setHoveredCategory(null);
    setMobileCategoryOpen(null);
    setMobileSectionOpen((prev) => ({ ...prev, subcategories: false }));
  };

  const toggleMobileSection = (section) => {
    setMobileSectionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleMobileCategory = (category) => {
    setMobileCategoryOpen((prev) => {
      const newState = prev === category ? null : category;
      if (newState) {
        toggleFilter("category", category);
      } else {
        setActiveFilters((prev) => ({
          ...prev,
          category: prev.category.filter((c) => c !== category),
          subCategory: [],
        }));
      }
      return newState;
    });
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    const subject = `Missing Book Request: ${reportBook.name}`;
    const body = `Book Name: ${reportBook.name}\nDescription: ${reportBook.description}\n\nPlease add this book to the store.`;
    const mailtoLink = `mailto:hadibooksstore01@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setReportBook({ name: "", description: "" });
  };

  const FilterBadge = ({ label, onRemove }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2 mb-2">
      {label}
      <button
        type="button"
        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-red-400 hover:bg-red-200 hover:text-red-500 focus:outline-none"
        onClick={onRemove}
      >
        <svg
          className="h-2 w-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 8 8"
        >
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <Title text1="EXPLORE" text2="OUR COLLECTION" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 mb-8"
        >
          <p className="text-center text-xs sm:text-base text-gray-600 font-medium font-['Poppins',sans-serif] max-w-sm sm:max-w-2xl mx-auto italic tracking-wide leading-relaxed">
            Discover your next favorite read from our carefully curated
            selection
          </p>
        </motion.div>

        {/* Category Menu - Desktop Only */}
        <div className="hidden lg:block mb-6 relative z-20">
          <div className="flex flex-wrap gap-2 justify-center">
            {fixedCategories.map((category, index) => (
              <div
                key={category}
                className={`relative group category-${index}`}
                onMouseEnter={() => handleCategoryHover(category)}
                onMouseLeave={handleCategoryLeave}
              >
                <button
                  onClick={() => toggleFilter("category", category)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-300 shadow-sm border ${
                    activeFilters.category.includes(category)
                      ? "bg-red-50 text-red-700 font-semibold border-red-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-100"
                  } min-w-[150px] text-center`}
                >
                  <span className="capitalize truncate">{category}</span>
                  <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {category === "Used & Affordable"
                      ? products.length
                      : products.filter((p) => p.category === category).length}
                  </span>
                </button>
                {hoveredCategory === category &&
                  subCategoriesByCategory[category].length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-y-auto"
                      onMouseEnter={() => handleCategoryHover(category)}
                      onMouseLeave={handleCategoryLeave}
                    >
                      <div className="grid grid-cols-3 gap-2 p-4">
                        {subCategoriesByCategory[category].map((subCat) => (
                          <button
                            key={subCat}
                            onClick={() => handleSubCategoryClick(subCat)}
                            className="block text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 font-medium rounded-md transition-colors duration-200"
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Active filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center">
              {activeFilters.searchQuery && (
                <FilterBadge
                  label={`Search: ${activeFilters.searchQuery}`}
                  onRemove={() => {
                    setActiveFilters((prev) => ({
                      ...prev,
                      searchQuery: "",
                    }));
                    navigate("/collections");
                  }}
                />
              )}
              {activeFilters.category.map((category) => (
                <FilterBadge
                  key={category}
                  label={category}
                  onRemove={() => {
                    toggleFilter("category", category);
                    setMobileCategoryOpen(null);
                  }}
                />
              ))}
              {activeFilters.subCategory.map((subCategory) => (
                <FilterBadge
                  key={subCategory}
                  label={subCategory}
                  onRemove={() => toggleFilter("subCategory", subCategory)}
                />
              ))}
              {activeFilters.rating && (
                <FilterBadge
                  label={`${activeFilters.rating}+ Stars`}
                  onRemove={() =>
                    toggleSingleFilter("rating", activeFilters.rating)
                  }
                />
              )}
              {activeFilters.availability !== "all" && (
                <FilterBadge
                  label={
                    activeFilters.availability === "in-stock"
                      ? "In Stock"
                      : "Bestsellers"
                  }
                  onRemove={() =>
                    toggleSingleFilter(
                      "availability",
                      activeFilters.availability
                    )
                  }
                />
              )}
              {(activeFilters.priceRange[0] !== minPrice ||
                activeFilters.priceRange[1] !== maxPrice) && (
                <FilterBadge
                  label={`${currency}${activeFilters.priceRange[0]} - ${currency}${activeFilters.priceRange[1]}`}
                  onRemove={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      priceRange: [minPrice, maxPrice],
                    }))
                  }
                />
              )}
            </div>
            {(activeFilters.category.length > 0 ||
              activeFilters.subCategory.length > 0 ||
              activeFilters.rating ||
              activeFilters.availability !== "all" ||
              activeFilters.priceRange[0] !== minPrice ||
              activeFilters.priceRange[1] !== maxPrice ||
              activeFilters.searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-300"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-6 lg:gap-8">
          {/* Filters sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100 w-48">
              <div className="space-y-4 pr-2">
                {/* Price Range */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-[#00308F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Price Range
                  </h3>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>
                        {currency}
                        {activeFilters.priceRange[0]}
                      </span>
                      <span>
                        {currency}
                        {activeFilters.priceRange[1]}
                      </span>
                    </div>
                    <div className="px-1">
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={activeFilters.priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00308F]"
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={activeFilters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00308F] mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-[#00308F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3 .922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783 .57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81 .588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Rating
                  </h3>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }, (_, i) => 5 - i).map(
                      (rating) => (
                        <button
                          key={rating}
                          onClick={() => toggleSingleFilter("rating", rating)}
                          className={`flex items-center w-full text-left px-2 py-1.5 rounded-lg transition-colors duration-300 text-sm ${
                            activeFilters.rating === rating
                              ? "bg-red-50 text-red-700 font-semibold"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-xs">& Up</span>
                          </div>
                          <span className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {
                              products.filter((p) => (p.rating || 0) >= rating)
                                .length
                            }
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Subcategories */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-[#00308F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Subcategories
                  </h3>
                  <div className="space-y-1">
                    {uniqueSubCategories.length > 0 ? (
                      uniqueSubCategories.map((subCat) => (
                        <button
                          key={subCat}
                          onClick={() => handleSubCategoryClick(subCat)}
                          className={`flex items-center w-full text-left px-2 py-1.5 rounded-lg transition-colors duration-300 text-xs ${
                            activeFilters.subCategory.includes(subCat)
                              ? "bg-red-50 text-red-700 font-semibold"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span className="truncate">{subCat}</span>
                          <span className="ml-auto text-xs bg-gray-100 px-1 py-0.5 rounded-full">
                            {
                              products.filter(
                                (p) =>
                                  p.subCategories &&
                                  p.subCategories.some(
                                    (sub) => cleanSubCategory(sub) === subCat
                                  )
                              ).length
                            }
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 py-2">
                        No subcategories available
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-[#00308F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Availability
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSingleFilter("availability", "all")}
                      className={`flex items-center w-full text-left px-2 py-1.5 rounded-lg transition-colors duration-300 text-sm ${
                        activeFilters.availability === "all"
                          ? "bg-red-50 text-red-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-xs">All Books</span>
                    </button>
                    <button
                      onClick={() =>
                        toggleSingleFilter("availability", "in-stock")
                      }
                      className={`flex items-center w-full text-left px-2 py-1.5 rounded-lg transition-colors duration-300 text-sm ${
                        activeFilters.availability === "in-stock"
                          ? "bg-red-50 text-red-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-xs">In Stock</span>
                    </button>
                    <button
                      onClick={() =>
                        toggleSingleFilter("availability", "bestseller")
                      }
                      className={`flex items-center w-full text-left px-2 py-1.5 rounded-lg transition-colors duration-300 text-sm ${
                        activeFilters.availability === "bestseller"
                          ? "bg-red-50 text-red-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-xs">Bestsellers</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filters button and sort options */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-100 rounded-2xl shadow-sm text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00308F] transition-all duration-300"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Filters
            </button>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white border border-gray-100 rounded-2xl pl-3 pr-8 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00308F] transition-all duration-300"
              >
                <option value="featured">Featured</option>
                <option value="new-books">New Books</option>
                <option value="old-books">Old Books</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile filters panel */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <>
                {/* Overlay with blur effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileFiltersOpen(false)}
                />

                {/* Sliding Panel */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 flex flex-col"
                >
                  {/* Header with Close Button */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                      <img
                        src="/logo.png"
                        alt="Hadi Books Store"
                        className="w-10 h-10 mr-3"
                      />
                      <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                    </div>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 transition duration-200"
                      aria-label="Close filters"
                    >
                      <FiX className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                      {/* Categories */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Categories
                        </h4>
                        {fixedCategories.map((category) => (
                          <div key={category} className="mb-2">
                            <button
                              onClick={() => toggleMobileCategory(category)}
                              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                                activeFilters.category.includes(category)
                                  ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className="capitalize truncate flex-1 text-left">
                                {category}
                              </span>
                              <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {category === "Used & Affordable"
                                  ? products.length
                                  : products.filter((p) => p.category === category)
                                      .length}
                              </span>
                            </button>
                            {mobileCategoryOpen === category &&
                              subCategoriesByCategory[category].length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-4 mt-2 space-y-1"
                                >
                                  {subCategoriesByCategory[category].map(
                                    (subCat) => (
                                      <button
                                        key={subCat}
                                        onClick={() =>
                                          handleSubCategoryClick(subCat)
                                        }
                                        className={`block w-full text-left px-3 py-1 text-sm transition-colors duration-200 ${
                                          activeFilters.subCategory.includes(subCat)
                                            ? "text-red-700 font-semibold"
                                            : "text-gray-600 hover:text-gray-800"
                                        }`}
                                      >
                                        {subCat}
                                      </button>
                                    )
                                  )}
                                </motion.div>
                              )}
                          </div>
                        ))}
                      </div>

                      {/* Price Range */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Price Range
                        </h4>
                        <div className="mb-4 px-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-3">
                            <span>
                              {currency}
                              {activeFilters.priceRange[0]}
                            </span>
                            <span>
                              {currency}
                              {activeFilters.priceRange[1]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={activeFilters.priceRange[0]}
                            onChange={(e) => handlePriceChange(e, 0)}
                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00308F]"
                          />
                          <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={activeFilters.priceRange[1]}
                            onChange={(e) => handlePriceChange(e, 1)}
                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00308F] mt-3"
                          />
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Rating
                        </h4>
                        {Array.from({ length: 5 }, (_, i) => 5 - i).map(
                          (rating) => (
                            <button
                              key={rating}
                              onClick={() => toggleSingleFilter("rating", rating)}
                              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                                activeFilters.rating === rating
                                  ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center flex-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-sm">& Up</span>
                              </div>
                              <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {
                                  products.filter((p) => (p.rating || 0) >= rating)
                                    .length
                                }
                              </span>
                            </button>
                          )
                        )}
                      </div>

                      {/* Subcategories */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Subcategories
                        </h4>
                        {uniqueSubCategories.length > 0 ? (
                          uniqueSubCategories.map((subCat) => (
                            <button
                              key={subCat}
                              onClick={() => handleSubCategoryClick(subCat)}
                              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                                activeFilters.subCategory.includes(subCat)
                                  ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className="truncate flex-1 text-left">
                                {subCat}
                              </span>
                              <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {
                                  products.filter(
                                    (p) =>
                                      p.subCategories &&
                                      p.subCategories.some(
                                        (sub) => cleanSubCategory(sub) === subCat
                                      )
                                  ).length
                                }
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 py-2">
                            No subcategories available
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Availability
                        </h4>
                        <button
                          onClick={() => toggleSingleFilter("availability", "all")}
                          className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                            activeFilters.availability === "all"
                              ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm flex-1 text-left">All Books</span>
                        </button>
                        <button
                          onClick={() =>
                            toggleSingleFilter("availability", "in-stock")
                          }
                          className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                            activeFilters.availability === "in-stock"
                              ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm flex-1 text-left">In Stock</span>
                        </button>
                        <button
                          onClick={() =>
                            toggleSingleFilter("availability", "bestseller")
                          }
                          className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                            activeFilters.availability === "bestseller"
                              ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm flex-1 text-left">Bestsellers</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer with WhatsApp */}
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <a
                      href="https://wa.me/923090005634"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition duration-200 font-medium"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <img
                        src={assets.whatsapp_icon}
                        alt="WhatsApp"
                        className="w-5 h-5 mr-2"
                      />
                      Contact via WhatsApp
                    </a>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="lg:col-span-5">
            <div className="hidden lg:flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600 font-medium">
                Showing{" "}
                <span className="font-semibold">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "book" : "books"}
                {activeFilters.searchQuery && (
                  <span>
                    {" "}
                    for "
                    <span className="font-semibold">
                      {activeFilters.searchQuery}
                    </span>
                    "
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-medium">
                  Sort by:
                </span>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-gray-100 rounded-2xl pl-3 pr-8 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00308F] transition-all duration-300"
                  >
                    <option value="featured">Featured</option>
                    <option value="new-books">New Books</option>
                    <option value="old-books">Old Books</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {paginatedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductItems
                        id={product.id}
                        image={product.image}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        category={product.category}
                        bestseller={product.bestseller}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pageNumbers.length > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                        }`}
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>

                      {getPageNumbersToShow().map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                            currentPage === number
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === pageNumbers.length}
                        className={`p-2 rounded-lg border ${
                          currentPage === pageNumbers.length
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                        }`}
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12 max-w-md mx-auto"
              >
                <FiBook className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  No Books Found
                </h3>
                <p className="mt-2 text-base text-gray-600 max-w-xs mx-auto">
                  Can't find your book? Tell us the name and a brief
                  description, and we'll add it within 24 hours!
                </p>
                <div className="mt-6 space-y-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={reportBook.name}
                      onChange={(e) =>
                        setReportBook({ ...reportBook, name: e.target.value })
                      }
                      placeholder="Book Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                      required
                    />
                    <textarea
                      value={reportBook.description}
                      onChange={(e) =>
                        setReportBook({
                          ...reportBook,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief Description (e.g., author, edition)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                      rows="3"
                      required
                    />
                    <button
                      onClick={handleReportSubmit}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 text-sm"
                    >
                      Request Book
                    </button>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="inline-block px-4 py-2 bg-transparent text-red-600 font-semibold rounded-lg border border-red-600 hover:bg-red-50 transition-all duration-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Collections;