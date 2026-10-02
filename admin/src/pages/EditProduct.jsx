import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { backendURL } from '../App';

const EditProduct = () => {
  const { admin } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategories: '',
    author: '',
    isbn: '',
    language: '',
    bestseller: false,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setFetchLoading(true);
      try {
        const response = await axios.get(`${backendURL}/api/adminCtrl/single/${id}`, {
          headers: { Authorization: `Bearer ${admin.token}` },
          withCredentials: true,
        });
        if (response.data.success) {
          const { product } = response.data;
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
            category: product.category,
            subCategories: Array.isArray(product.subCategories) ? product.subCategories.join(', ') : '',
            author: product.author,
            isbn: product.isbn || '',
            language: product.language,
            bestseller: product.bestseller,
          });
          setCurrentImage(product.image);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id, admin.token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 250 * 1024) {
      setError('Image size exceeds 250KB limit');
      setImage(null);
      setImagePreview(null);
      e.target.value = null;
      return;
    }
    
    setImage(file);
    setError('');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.originalPrice && (isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) <= 0)) {
      setError('Original price must be a positive number');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'subCategories') {
        const subCats = formData.subCategories
          .split(',')
          .map((cat) => cat.trim())
          .filter((cat) => cat.length > 0);
        if (subCats.length > 0) {
          data.append(key, JSON.stringify(subCats));
        }
      } else if (formData[key] !== undefined && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });
    if (image) data.append('image', image);

    try {
      const response = await axios.put(`${backendURL}/api/adminCtrl/update/${id}`, data, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setSuccess('Product updated successfully');
        setTimeout(() => navigate('/admin/list'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black flex items-center justify-center h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <svg className="animate-spin h-8 sm:h-10 w-8 sm:w-10 text-orange-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 sm:mt-4 text-gray-400 text-sm sm:text-base">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Edit Product</h1>
          <p className="text-xs sm:text-sm text-gray-400">Update the details of your product</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 sm:p-6 shadow-2xl">
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

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                  placeholder="Enter product name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Price *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="originalPrice" className="block text-xs sm:text-sm font-medium text-gray-300">
                Original Price (optional)
              </label>
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Original price (for discounts)"
                min="0.01"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-300">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Enter product description (max 1000 characters)"
                maxLength={1000}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 text-right">{formData.description.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Category *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                  placeholder="Enter category"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="author" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Author *
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                  placeholder="Enter author name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="subCategories" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Subcategories
                </label>
                <input
                  id="subCategories"
                  name="subCategories"
                  type="text"
                  value={formData.subCategories}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                  placeholder="e.g., Fiction, Thriller, Mystery"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="language" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Language *
                </label>
                <input
                  id="language"
                  name="language"
                  type="text"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                  placeholder="Enter language"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="isbn" className="block text-xs sm:text-sm font-medium text-gray-300">
                ISBN (optional)
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                value={formData.isbn}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Enter ISBN"
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-xl">
              <label htmlFor="bestseller" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    id="bestseller"
                    name="bestseller"
                    type="checkbox"
                    checked={formData.bestseller}
                    onChange={handleInputChange}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`block w-10 sm:w-12 h-5 sm:h-6 rounded-full ${formData.bestseller ? 'bg-orange-500' : 'bg-gray-600'} transition-all duration-300`}></div>
                  <div className={`absolute left-1 top-0.5 sm:top-1 bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full transition-transform duration-300 ${formData.bestseller ? 'transform translate-x-5 sm:translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-xs sm:text-sm font-medium text-gray-300">
                  Bestseller
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="block text-xs sm:text-sm font-medium text-gray-300">
                Product Image
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-600/50 rounded-xl cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-all duration-300">
                      <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-5 sm:pb-6">
                        <svg className="w-6 sm:w-8 h-6 sm:h-8 mb-2 sm:mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG (MAX. 250KB)</p>
                      </div>
                      <input 
                        id="image" 
                        name="image" 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png" 
                        onChange={handleImageChange} 
                        className="hidden" 
                        disabled={loading} 
                      />
                    </label>
                  </div>
                </div>

                {(imagePreview || currentImage) && (
                  <div className="flex-shrink-0">
                    <div className="relative w-24 sm:w-32 h-24 sm:h-32 rounded-xl overflow-hidden border border-gray-600/50">
                      <img 
                        src={imagePreview || currentImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                          document.getElementById('image').value = null;
                        }}
                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 sm:p-1.5"
                      >
                        <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Product...
                  </>
                ) : (
                  <>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Update Product
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/list')}
                disabled={loading}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-gray-600 hover:bg-gray-500 text-white text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to List
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;