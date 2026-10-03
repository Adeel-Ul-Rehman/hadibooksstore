import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

const SearchBar = ({ isNavbar = false, onSearchSubmit, onQueryChange }) => {
  const { apiRequest } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        try {
          const data = await apiRequest('get', `/api/products/get?search=${encodeURIComponent(query)}`);
          if (data.success) {
            setSuggestions(data.products.slice(0, 5));
            setShowSuggestions(true);
            if (onQueryChange) onQueryChange(query);
          }
        } catch (error) {
          console.error('Search Error:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        if (onQueryChange) onQueryChange('');
      }
    };
    fetchSuggestions();
  }, [query, apiRequest, onQueryChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        if (isNavbar) setShowSearchBar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNavbar]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(query);
      } else {
        navigate(`/collections?search=${encodeURIComponent(query)}`);
      }
      setShowSuggestions(false);
      setShowSearchBar(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setQuery('');
    setShowSuggestions(false);
    setShowSearchBar(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowSearchBar(false);
    }
  };

  if (isNavbar) {
    return (
      <div className="relative" ref={searchRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full text-stone-700 dark:text-stone-300 hover:text-amber-700 hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors duration-200 cursor-pointer flex items-center justify-center"
          onClick={() => {
            setShowSearchBar(!showSearchBar);
            setQuery('');
          }}
          aria-label="Toggle search"
        >
          <img src={assets.search_icon} alt="Search" className="w-5 h-5 dark:invert" />
        </motion.button>

        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 left-0 right-0 py-4 px-4 editorial-glass dark:editorial-glass-dark border-b border-stone-200/80 dark:border-stone-800 shadow-md z-40"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative">
                <input
                  type="text"
                  placeholder="Search by title, author, category, or ISBN..."
                  className="w-full py-3 pl-5 pr-20 rounded-full border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 shadow-sm text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-150"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 text-stone-500 hover:text-amber-700 transition-colors"
                  aria-label="Submit search"
                >
                  <img src={assets.search_icon} alt="Search" className="w-4 h-4 dark:invert" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
                  onClick={() => {
                    setShowSearchBar(false);
                    setQuery('');
                  }}
                  aria-label="Close search"
                >
                  <img src={assets.cross_icon} alt="Close" className="w-4 h-4 dark:invert" />
                </button>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-xl z-50 border border-stone-200 dark:border-stone-800 overflow-hidden"
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <div
                          key={product.id}
                          className="px-4 py-3 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 cursor-pointer flex items-center border-b border-stone-100 dark:border-stone-800/60 last:border-0 transition-colors"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-13 object-cover rounded-md shadow-xs mr-3.5"
                          />
                          <div>
                            <div className="font-medium text-sm text-stone-900 dark:text-stone-100">{product.name}</div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 capitalize">{product.category}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-stone-500 dark:text-stone-400 text-center">
                        No books found matching your query
                      </div>
                    )}
                  </motion.div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search books, authors, categories..."
            className="w-full py-2.5 px-4 pr-12 rounded-full border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 shadow-xs text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all duration-150"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          <button
            type="submit"
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 p-1 text-stone-400 hover:text-amber-700 transition-colors"
            aria-label="Submit search"
          >
            <img src={assets.search_icon} alt="Search" className="w-4 h-4 dark:invert" />
          </button>
        </div>
      </form>
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-xl z-50 border border-stone-200 dark:border-stone-800 overflow-hidden"
          >
            {suggestions.length > 0 ? (
              suggestions.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-3 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 cursor-pointer flex items-center border-b border-stone-100 dark:border-stone-800/60 last:border-0 transition-colors"
                  onClick={() => handleSuggestionClick(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-13 object-cover rounded-md shadow-xs mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm text-stone-900 dark:text-stone-100">{product.name}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 capitalize">{product.category}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-stone-500 dark:text-stone-400 text-center">
                No books found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
