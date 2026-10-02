import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { backendURL } from '../App';

const Add = () => {
  const { admin } = useContext(AppContext);
  const navigate = useNavigate();
  const [useJsonInput, setUseJsonInput] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
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
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleJsonInputChange = (e) => {
    setJsonInput(e.target.value);
    setError('');
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

  const validateJsonData = (data) => {
    const { name, description, price, category, author, language, originalPrice, subCategories, isbn } = data;

    if (!name || !description || !price || !category || !author || !language) {
      return 'Please provide all required fields (name, description, price, category, author, language)';
    }
    if (typeof name !== 'string' || name.length > 255) {
      return 'Product name must be a string of 255 characters or less';
    }
    if (typeof description !== 'string' || description.length > 1000) {
      return 'Description must be a string of 1000 characters or less';
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      return 'Price must be a positive number';
    }
    if (originalPrice && (isNaN(originalPrice) || parseFloat(originalPrice) <= 0)) {
      return 'Original price must be a positive number';
    }
    if (typeof category !== 'string' || category.trim() === '') {
      return 'Category must be a non-empty string';
    }
    if (typeof author !== 'string' || author.trim() === '') {
      return 'Author must be a non-empty string';
    }
    if (typeof language !== 'string' || language.trim() === '') {
      return 'Language must be a non-empty string';
    }
    if (subCategories && !Array.isArray(subCategories)) {
      return 'Subcategories must be an array of strings';
    }
    if (isbn && typeof isbn !== 'string') {
      return 'ISBN must be a string';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Check if admin is authenticated
    if (!admin || !admin.token) {
      setError('Admin authentication required. Please log in again.');
      setLoading(false);
      navigate('/admin/login');
      return;
    }

    let dataToSubmit = formData;

    if (useJsonInput) {
      try {
        const parsedData = JSON.parse(jsonInput);
        const validationError = validateJsonData(parsedData);
        if (validationError) {
          setError(validationError);
          setLoading(false);
          return;
        }
        dataToSubmit = parsedData;
      } catch (err) {
        setError('Invalid JSON format');
        setLoading(false);
        return;
      }
    } else {
      const { name, description, price, category, author, language } = formData;
      if (!name || !description || !price || !category || !author || !language) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      if (name.length > 255) {
        setError('Product name must be 255 characters or less');
        setLoading(false);
        return;
      }
      if (description.length > 1000) {
        setError('Description must be 1000 characters or less');
        setLoading(false);
        return;
      }
      if (isNaN(price) || parseFloat(price) <= 0) {
        setError('Price must be a positive number');
        setLoading(false);
        return;
      }
      if (formData.originalPrice && (isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) <= 0)) {
        setError('Original price must be a positive number');
        setLoading(false);
        return;
      }
    }

    if (!image) {
      setError('Please upload an image');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(dataToSubmit).forEach((key) => {
      if (key === 'subCategories') {
        const subCats = useJsonInput
          ? Array.isArray(dataToSubmit.subCategories)
            ? dataToSubmit.subCategories
            : dataToSubmit.subCategories
                .split(',')
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0)
          : formData.subCategories
              .split(',')
              .map((cat) => cat.trim())
              .filter((cat) => cat.length > 0);
        if (subCats.length > 0) {
          data.append(key, JSON.stringify(subCats));
        }
      } else if (dataToSubmit[key] && dataToSubmit[key].toString().trim() !== '') {
        data.append(key, dataToSubmit[key]);
      }
    });
    data.append('image', image);

    // Temporary debug log (remove before deployment)
    console.log('Submitting FormData:', {
      name: dataToSubmit.name,
      description: dataToSubmit.description,
      price: dataToSubmit.price,
      originalPrice: dataToSubmit.originalPrice,
      category: dataToSubmit.category,
      subCategories: dataToSubmit.subCategories,
      author: dataToSubmit.author,
      isbn: dataToSubmit.isbn,
      language: dataToSubmit.language,
      image: image.name,
    });

    try {
      const response = await axios.post(`${backendURL}/api/adminCtrl/add`, data, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setSuccess('Product added successfully');
        setTimeout(() => navigate('/admin/list'), 2000);
      } else {
        setError(response.data.message || 'Failed to add product');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add product';
      setError(`Failed to add product: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Add New Product</h1>
          <p className="text-sm sm:text-base text-gray-400">Enter product details via JSON or form and upload an image</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 sm:p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 text-xs sm:text-sm backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-xl text-green-200 text-xs sm:text-sm backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {success}
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-300">
                Input Method
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="inputMethod"
                    checked={!useJsonInput}
                    onChange={() => setUseJsonInput(false)}
                    className="form-radio text-orange-500 focus:ring-orange-500"
                    disabled={loading}
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-300">Form</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="inputMethod"
                    checked={useJsonInput}
                    onChange={() => setUseJsonInput(true)}
                    className="form-radio text-orange-500 focus:ring-orange-500"
                    disabled={loading}
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-300">JSON</span>
                </label>
              </div>
            </div>

            {useJsonInput ? (
              <div className="space-y-2">
                <label htmlFor="jsonInput" className="block text-xs sm:text-sm font-medium text-gray-300">
                  JSON Product Details *
                </label>
                <textarea
                  id="jsonInput"
                  name="jsonInput"
                  value={jsonInput}
                  onChange={handleJsonInputChange}
                  rows="6"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                  placeholder={`Paste JSON data, e.g.:
{
  "name": "Book Title",
  "description": "Book description",
  "price": 29.99,
  "originalPrice": 39.99,
  "category": "Fiction",
  "subCategories": ["Thriller", "Mystery"],
  "author": "Author Name",
  "isbn": "1234567890123",
  "language": "English"
}`}
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                      placeholder="Enter product name (max 255 characters)"
                      maxLength={255}
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                      placeholder="0.00"
                      min="0.01"
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
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
                    rows="3"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                    placeholder="Enter product description (max 1000 characters)"
                    maxLength={1000}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 text-right">{formData.description.length}/1000</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                      placeholder="Enter author name"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                    placeholder="Enter ISBN"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div className="space-y-3 sm:space-y-4">
              <label htmlFor="image" className="block text-xs sm:text-sm font-medium text-gray-300">
                Product Image *
              </label>
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="w-full">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-600/50 rounded-2xl cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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

                {imagePreview && (
                  <div className="flex justify-center sm:justify-start">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-gray-600/50">
                      <img 
                        src={imagePreview} 
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
                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 sm:py-3 px-4 inline-flex justify-center items-center gap-2 rounded-xl border border-transparent font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;