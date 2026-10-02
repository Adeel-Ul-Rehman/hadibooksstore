import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { backendURL } from "../App";

const HeroImages = () => {
  const {
    heroImages,
    fetchHeroImages,
    addHeroImage,
    updateHeroImage,
    toggleHeroImageAvailability,
    deleteHeroImage,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    file: null,
    altText: "",
    previewUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState(null);

  useEffect(() => {
    const loadHeroImages = async () => {
      try {
        const token = sessionStorage.getItem("adminToken");
        const response = await axios.get(
          `${backendURL}/api/adminCtrl/hero/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setActiveCount(response.data.activeCount || 0);
        }
      } catch (error) {
        console.error("Error loading hero images count:", error);
      }
    };

    fetchHeroImages();
    loadHeroImages();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const tempUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, file, previewUrl: tempUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !formData.file) {
      setError("Please select an image file");
      return;
    }

    if (activeCount >= 10 && !editingId) {
      setError(
        "Maximum limit of 10 active hero images reached. Please deactivate some images first."
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      if (formData.file) {
        data.append("image", formData.file);
      }
      data.append("altText", formData.altText);

      let result;
      if (editingId) {
        result = await updateHeroImage(editingId, data);
      } else {
        result = await addHeroImage(data);
      }

      if (result.success) {
        setFormData({ file: null, altText: "", previewUrl: "" });
        setEditingId(null);
        const token = sessionStorage.getItem("adminToken");
        const response = await axios.get(
          `${backendURL}/api/adminCtrl/hero/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setActiveCount(response.data.activeCount || 0);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        "Operation failed: " +
          (error.response?.data?.message || "Please check your connection")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    if (currentStatus === false && activeCount >= 10) {
      setError(
        "Maximum limit of 10 active hero images reached. Please deactivate some images first."
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await toggleHeroImageAvailability(id);
      if (result.success) {
        const token = sessionStorage.getItem("adminToken");
        const response = await axios.get(
          `${backendURL}/api/adminCtrl/hero/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setActiveCount(response.data.activeCount || 0);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      setError("Failed to toggle availability");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (image) => {
    setFormData({
      file: null,
      altText: image.altText || "",
      previewUrl: image.imageUrl,
    });
    setEditingId(image.id);
    setError("");
  };

  const handleDeleteClick = (id) => {
    setDeleteImageId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteHeroImage(deleteImageId);
      const token = sessionStorage.getItem("adminToken");
      const response = await axios.get(`${backendURL}/api/adminCtrl/hero/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setActiveCount(response.data.activeCount || 0);
      }
      fetchHeroImages();
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to delete image");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteImageId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteImageId(null);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
          Manage Hero Images
        </h2>

        {/* Active Images Counter */}
        <div className="bg-orange-600/20 border border-orange-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-orange-300">
                Active Images: {activeCount}/10
              </h3>
              <p className="text-orange-200 text-xs sm:text-sm">
                Maximum 10 images can be active at once
              </p>
            </div>
            {activeCount >= 10 && (
              <div className="mt-2 sm:mt-0 bg-red-600/30 border border-red-500/50 rounded-lg p-2">
                <p className="text-red-200 text-xs sm:text-sm">
                  Limit reached! Deactivate images to add new ones
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 text-xs sm:text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
            {editingId ? "Edit Hero Image" : "Add New Hero Image"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                Upload Image {editingId ? "(Optional)" : "(Required)"}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="w-full p-2 sm:p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm"
                disabled={uploading || (activeCount >= 10 && !editingId)}
              />
              {uploading && (
                <p className="text-xs sm:text-sm text-gray-400 mt-2 flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-orange-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </p>
              )}
            </div>

            {formData.previewUrl && (
              <div className="mt-3">
                <p className="text-xs sm:text-sm text-gray-300 mb-2">
                  Preview:
                </p>
                <img
                  src={formData.previewUrl}
                  alt="Preview"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl border-2 border-orange-500/30"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                Alt Text (Optional)
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) =>
                  setFormData({ ...formData, altText: e.target.value })
                }
                className="w-full p-2 sm:p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm"
                placeholder="Description for accessibility"
                disabled={activeCount >= 10 && !editingId}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <button
                type="submit"
                disabled={
                  loading ||
                  uploading ||
                  (!formData.file && !editingId) ||
                  (activeCount >= 10 && !editingId)
                }
                className="bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-all duration-300 flex items-center text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : editingId ? (
                  "Update Image"
                ) : (
                  "Add Image"
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ file: null, altText: "", previewUrl: "" });
                    setError("");
                  }}
                  className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 text-xs sm:text-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Images List */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
            Current Hero Images ({heroImages.length})
          </h3>

          {heroImages.length === 0 ? (
            <p className="text-gray-400 text-center py-6 sm:py-8 text-xs sm:text-sm">
              No hero images added yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {heroImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm"
                >
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.altText || "Hero image"}
                      className="w-full h-36 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4 border-2 border-orange-500/20"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Image+Not+Found";
                      }}
                    />
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          image.isActive
                            ? "bg-green-600/80 text-green-100"
                            : "bg-gray-600/80 text-gray-300"
                        }`}
                      >
                        {image.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 mb-3 truncate">
                    {image.altText || "No alt text provided"}
                  </p>

                  {/* Fixed Button Container */}
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() =>
                        handleToggleAvailability(image.id, image.isActive)
                      }
                      disabled={loading}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all duration-300 flex items-center justify-center bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={
                            image.isActive
                              ? "M6 18L18 6M6 6l12 12"
                              : "M5 13l4 4L19 7"
                          }
                        ></path>
                      </svg>
                      {image.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => handleEdit(image)}
                      disabled={loading}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all duration-300 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteClick(image.id)}
                      disabled={loading}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all duration-300 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gray-800/90 border border-gray-700/50 rounded-xl p-4 sm:p-6 max-w-sm w-full">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                Confirm Deletion
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6">
                Are you sure you want to delete this hero image? This action
                cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-sm disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroImages;
