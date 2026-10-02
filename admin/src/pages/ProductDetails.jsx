import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { backendURL } from '../App';

const ProductDetails = () => {
  const { admin } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibleReviews, setVisibleReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 3;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${backendURL}/api/adminCtrl/single/${id}`, {
          headers: { Authorization: `Bearer ${admin.token}` },
          withCredentials: true,
        });
        if (response.data.success) {
          const productData = response.data.product;
          setProduct(productData);
          // Sort reviews by createdAt descending and set initial visible reviews
          if (productData.reviews && productData.reviews.length > 0) {
            const sortedReviews = [...productData.reviews].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setVisibleReviews(sortedReviews.slice(0, reviewsPerPage));
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, admin.token]);

  const formatPrice = (price) => {
    return `Rs. ${price?.toFixed(2) || '0.00'}`;
  };

  const handleLoadMore = () => {
    const nextPage = reviewPage + 1;
    const sortedReviews = [...(product?.reviews || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const newReviews = sortedReviews.slice(0, nextPage * reviewsPerPage);
    setVisibleReviews(newReviews);
    setReviewPage(nextPage);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-gradient-to-b from-black to-gray-900 p-4 sm:p-6 rounded-xl shadow-2xl border border-orange-600">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-100 mb-4 sm:mb-6 text-center md:text-left">Product Details</h2>
        {error && (
          <div className="bg-red-800 border-red-600 text-white px-3 py-2 rounded-lg text-xs mb-3">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : !product ? (
          <p className="text-center text-gray-500">Product not found</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 relative w-full md:w-48 h-64 md:h-80">
              <div className="absolute inset-0 bg-gray-800 rounded-lg shadow-2xl transform -rotate-3 origin-center"></div>
              <div className="absolute inset-0 bg-gray-700 rounded-lg shadow-xl transform rotate-3 origin-center"></div>
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/200x300')}
              />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-lg md:text-xl font-bold text-sky-100">{product.name}</h3>
              <p className="text-sm text-orange-300 italic">{product.category} • {product.subCategories.join(', ') || 'No subcategories'}</p>
              <p className="text-base text-white leading-relaxed">{product.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-base font-semibold text-white">{formatPrice(product.price)}</p>
                </div>
                {product.originalPrice && (
                  <div>
                    <p className="text-sm text-gray-400">Original Price</p>
                    <p className="text-base font-semibold text-white line-through">{formatPrice(product.originalPrice)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Author</p>
                  <p className="text-base font-semibold text-white">{product.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ISBN</p>
                  <p className="text-base font-semibold text-white">{product.isbn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Language</p>
                  <p className="text-base font-semibold text-white">{product.language}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Bestseller</p>
                  <p className="text-base font-semibold text-white">{product.bestseller ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Availability</p>
                  <p className={`text-base font-semibold ${product.availability ? 'text-green-400' : 'text-red-400'}`}>
                    {product.availability ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => navigate(`/admin/edit/${product.id}`)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-all duration-300 shadow-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate('/admin/list')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sky-100 text-sm rounded-lg transition-all duration-300 shadow-md"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        )}
        {product && product.reviews && product.reviews.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-bold text-sky-100 mb-4">Customer Reviews</h4>
            <div className="space-y-6">
              {visibleReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700 flex flex-col sm:flex-row sm:items-start sm:space-x-4"
                >
                  <div className="flex-shrink-0 mb-3 sm:mb-0">
                    {review.user?.profilePicture ? (
                      <img
                        src={review.user.profilePicture}
                        alt={review.user?.name || 'User'}
                        className="w-12 h-12 rounded-full border-2 border-orange-400 object-cover"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/50?text=User')}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-600 border-2 border-orange-400 flex items-center justify-center text-white font-bold text-lg">
                        {review.user?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-sky-100">{review.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-orange-300">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-white ml-2">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{review.comment || 'No comment'}</p>
                  </div>
                </div>
              ))}
            </div>
            {product.reviews.length > visibleReviews.length && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-all duration-300 shadow-md"
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;