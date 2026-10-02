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
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="cursor-pointer"
          onClick={() => {
            setShowSearchBar(!showSearchBar);
            setQuery('');
          }}
        >
          <img src={assets.search_icon} alt="Search" className="w-6 h-6" />
        </motion.div>

        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-16 left-0 right-0 py-4 px-4 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 shadow-md z-40"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto relative">
                <input
                  type="text"
                  placeholder="Search books, authors, categories..."
                  className="w-full py-3 px-5 pr-20 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm text-gray-800"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-10 top-1/2 transform -translate-y-1/2"
                >
                  <img src={assets.search_icon} alt="Search" className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    setShowSearchBar(false);
                    setQuery('');
                  }}
                >
                  <img src={assets.cross_icon} alt="Close" className="w-5 h-5" />
                </button>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-1 backdrop-blur-md bg-white/60 rounded-lg shadow-lg z-50 border border-gray-200"
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <div
                          key={product.id}
                          className="px-4 py-3 hover:bg-gray-100/50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-600">{product.category}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-600 text-center">
                        No matched books available
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
            className="w-full py-3 px-5 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm text-gray-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <img src={assets.search_icon} alt="Search" className="w-5 h-5" />
          </button>
        </div>
      </form>
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-1 backdrop-blur-md bg-white/60 rounded-lg shadow-lg z-50 border border-gray-200"
          >
            {suggestions.length > 0 ? (
              suggestions.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-3 hover:bg-gray-100/50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
                  onClick={() => handleSuggestionClick(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.category}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-600 text-center">
                No matched books available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
