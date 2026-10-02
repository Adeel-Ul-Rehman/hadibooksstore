import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { backendURL } from '../App';

const List = () => {
  const { admin } = useContext(AppContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [noProductsMessage, setNoProductsMessage] = useState('No products available yet');
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);

  const fetchProducts = async (page = 1, searchQuery = '', categoryFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendURL}/api/adminCtrl/list`, {
        params: { page, limit: 10, search: searchQuery, category: categoryFilter },
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
        setSuggestions(response.data.products.slice(0, 5));
        if (response.data.products.length === 0) {
          setNoProductsMessage(searchQuery || categoryFilter ? 'No products found' : 'No products available yet');
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [admin.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        fetchProducts(1, value, category);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        fetchProducts(1, '', category);
      }
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim().length >= 2) {
      fetchProducts(1, search, category);
      setShowSuggestions(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryInput(value);
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (value.trim().length >= 2 || value.trim().length === 0) {
        setCategory(value.trim());
        fetchProducts(1, search, value.trim());
      }
    }, 500);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (categoryInput.trim().length >= 2 || categoryInput.trim().length === 0) {
      setCategory(categoryInput.trim());
      fetchProducts(1, search, categoryInput.trim());
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/admin/product/${productId}`);
    setSearch('');
    setShowSuggestions(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchProducts(newPage, search, category);
    }
  };

  const handleToggleAvailability = async (id, currentAvailability) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.patch(`${backendURL}/api/adminCtrl/toggle-availability/${id}`, {}, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setSuccess(`Product availability ${currentAvailability ? 'disabled' : 'enabled'}`);
        setProducts(products.map(p => p.id === id ? { ...p, availability: !currentAvailability } : p));
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle availability');
    }
  };

  const handleToggleBestseller = async (id, currentBestseller) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.patch(`${backendURL}/api/adminCtrl/toggle-bestseller/${id}`, {}, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setSuccess(`Product bestseller status ${currentBestseller ? 'removed' : 'added'}`);
        setProducts(products.map(p => p.id === id ? { ...p, bestseller: !currentBestseller } : p));
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle bestseller status');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.delete(`${backendURL}/api/adminCtrl/remove/${id}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setSuccess('Product deleted successfully');
        setProducts(products.filter(p => p.id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1, pages: Math.ceil((prev.total - 1) / prev.limit) }));
        setConfirmDelete(null);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const formatPrice = (price) => {
    return `Rs. ${price?.toFixed(2) || '0.00'}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Product List</h2>
          <button
            onClick={() => navigate('/admin/add')}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg w-full sm:w-auto"
          >
            Add New Product
          </button>
        </div>
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 text-xs sm:text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-900/30 border border-green-700/50 rounded-xl text-green-200 text-xs sm:text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {success}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-4" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search books, authors, categories..."
              className="w-full py-2 sm:py-3 px-4 sm:px-5 pr-10 sm:pr-12 rounded-full border border-gray-600/50 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm text-xs sm:text-sm"
              ref={searchInputRef}
              onFocus={() => search.trim().length >= 2 && setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-gray-800/90 rounded-lg shadow-lg z-50 border border-gray-700/50 max-h-60 overflow-y-auto backdrop-blur-sm"
                >
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-700/50 cursor-pointer flex items-center border-b border-gray-600/50 last:border-0"
                      onClick={() => handleSuggestionClick(product.id)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 sm:w-10 h-12 sm:h-14 object-cover rounded mr-2 sm:mr-3"
                      />
                      <div>
                        <div className="font-medium text-white text-xs sm:text-sm">{product.name}</div>
                        <div className="text-xs text-gray-400">{product.category}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <form onSubmit={handleCategorySubmit} className="w-full sm:w-1/3 md:w-1/4">
            <input
              type="text"
              value={categoryInput}
              onChange={handleCategoryChange}
              placeholder="Filter by category"
              className="w-full py-2 sm:py-3 px-4 sm:px-5 rounded-full border border-gray-600/50 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm text-xs sm:text-sm"
            />
          </form>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-10 sm:h-12 w-10 sm:w-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-3 sm:ml-4 text-gray-400 text-sm sm:text-base">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-400 text-sm sm:text-base">{noProductsMessage}</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-lg p-3 sm:p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col lg:flex-row lg:justify-between items-center gap-3 sm:gap-4"
              >
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 sm:w-24 h-28 sm:h-36 object-cover rounded-lg shadow-md border border-gray-700 mx-auto sm:mx-0"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/80x120')}
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-orange-300">{product.category}</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2 max-w-md">{product.description}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <p className="text-xs sm:text-sm font-semibold text-white">{formatPrice(product.price)}</p>
                      {product.originalPrice && (
                        <p className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">Author: {product.author}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full lg:w-48 justify-center lg:justify-end">
                  <div className="flex items-center justify-center lg:justify-end gap-2">
                    <span className="text-xs text-gray-300">Available:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.availability}
                        onChange={() => handleToggleAvailability(product.id, product.availability)}
                        className="sr-only peer"
                        disabled={loading}
                      />
                      <div className="w-8 sm:w-9 h-4 sm:h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:bg-green-600 transition-all duration-300"></div>
                      <div className="absolute left-1 top-0.5 sm:top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 peer-checked:translate-x-4 sm:peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-center lg:justify-end gap-2">
                    <span className="text-xs text-gray-300">Bestseller:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.bestseller}
                        onChange={() => handleToggleBestseller(product.id, product.bestseller)}
                        className="sr-only peer"
                        disabled={loading}
                      />
                      <div className="w-8 sm:w-9 h-4 sm:h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:bg-yellow-600 transition-all duration-300"></div>
                      <div className="absolute left-1 top-0.5 sm:top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 peer-checked:translate-x-4 sm:peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                  <div className="flex flex-row justify-center lg:justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/product/${product.id}`)}
                      className="px-2 sm:px-3 py-1 bg-blue-600/50 hover:bg-blue-500/50 text-white text-xs rounded-lg transition-all duration-300 shadow-md"
                      title="View Details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/edit/${product.id}`)}
                      className="px-2 sm:px-3 py-1 bg-yellow-600/50 hover:bg-yellow-500/50 text-white text-xs rounded-lg transition-all duration-300 shadow-md"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(product.id)}
                      className="px-2 sm:px-3 py-1 bg-red-600/50 hover:bg-red-500/50 text-white text-xs rounded-lg transition-all duration-300 shadow-md"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 gap-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="px-4 py-2 bg-gray-700/50 text-white rounded-lg disabled:opacity-50 transition-all duration-300 shadow-md w-full sm:w-auto"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white text-xs sm:text-sm text-center">Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
              className="px-4 py-2 bg-gray-700/50 text-white rounded-lg disabled:opacity-50 transition-all duration-300 shadow-md w-full sm:w-auto"
            >
              Next
            </button>
          </div>
        )}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/90 p-4 sm:p-6 rounded-xl border border-gray-700/50 max-w-sm w-full backdrop-blur-md">
              <p className="text-white mb-3 sm:mb-4 text-center text-xs sm:text-sm">Are you sure you want to delete this product?</p>
              <div className="flex justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-red-600/50 hover:bg-red-500/50 text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;