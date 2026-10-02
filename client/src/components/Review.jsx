import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Review = ({ productId, isAuthenticated }) => {
  const { apiRequest, user } = useContext(AppContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch reviews for the product
  const fetchReviews = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoadingReviews(true);

      const data = await apiRequest(
        "get",
        `/api/reviews/product/${productId}?page=${pageNum}&limit=3`
      );

      if (data.success) {
        if (append) {
          setReviews((prev) => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }

        setHasMore(pageNum < data.pagination.pages);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.pagination.total || 0);
      }
    } catch (error) {
      console.error("Fetch Reviews Error:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load initial reviews
  useEffect(() => {
    if (productId) {
      fetchReviews(1, false);
    }
  }, [productId]);

  // Handle rating selection
  const handleRating = (value) => {
    setRating(value);
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to submit a review");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    if (!user?.id) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest("post", "/api/reviews/add", {
        productId,
        userId: user.id,
        rating,
        comment,
      });
      if (data.success) {
        toast.success("Review submitted successfully");
        setRating(0);
        setComment("");
        // Refresh reviews
        fetchReviews(1, false);
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Submit Review Error:", error);
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Invalid review data");
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle load more reviews
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Customer Reviews
        </h2>
        {totalReviews > 0 ? (
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-800 text-sm mt-1">
                Based on {totalReviews} reviews
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 text-sm">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>

      {/* Review Submission Form */}
      {isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-300"
        >
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Write a Review
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    className={`w-8 h-8 flex items-center justify-center ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    } hover:text-yellow-500 transition-colors`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00308F] focus:border-transparent text-sm"
                placeholder="Share your thoughts about the product..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 bg-[#00308F] text-white font-semibold rounded-lg shadow-md hover:bg-[#002570] transition-all duration-300 hover:shadow-lg text-center ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300 text-center">
          <p className="text-gray-800 text-sm">
            Please{" "}
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-[#00308F] hover:text-[#002570] font-medium hover:underline"
            >
              log in
            </button>{" "}
            to submit a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Reviews
            </h3>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-300"
              >
                <div className="flex items-start space-x-3">
                  {review.user.profilePicture ? (
                    <img
                      src={review.user.profilePicture}
                      alt={`${review.user.name} ${review.user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-800">
                        {review.user.name
                          ? review.user.name.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.user.name} {review.user.lastName}
                        </h4>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-800">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-gray-800 text-sm">{review.comment}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingReviews}
                  className={`px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm ${
                    loadingReviews ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingReviews ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </>
        )}

        {loadingReviews && reviews.length === 0 && (
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-6 w-6 rounded-full border-3 border-gray-300 border-t-[#00308F]"
            />
          </div>
        )}

        {!loadingReviews && reviews.length === 0 && (
          <p className="text-gray-800 text-sm text-center py-6">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
};

export default Review;