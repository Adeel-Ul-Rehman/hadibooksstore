import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { backendURL } from '../App';

const Profile = () => {
  const { admin, updateAdmin, fetchAdminProfile } = useContext(AppContext);
  const [name, setName] = useState(admin.name || '');
  const [email, setEmail] = useState(admin.email || '');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(admin.profilePicture || null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!admin.token) {
        setError('No authentication token found. Please log in.');
        navigate('/login');
        return;
      }
      
      // Only load once
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      
      setIsLoading(true);
      try {
        await fetchAdminProfile();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [admin.token, navigate]); // Removed fetchAdminProfile from dependencies

  useEffect(() => {
    setName(admin.name || '');
    setEmail(admin.email || '');
    setImagePreview(admin.profilePicture || null);
  }, [admin.name, admin.email, admin.profilePicture]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setError('Please select an image file (JPG, PNG)');
      setProfilePicture(null);
      setImagePreview(admin.profilePicture || null);
      e.target.value = null;
      return;
    }

    if (file.size > 250 * 1024) {
      setError('Image size exceeds 250KB limit');
      setProfilePicture(null);
      setImagePreview(admin.profilePicture || null);
      e.target.value = null;
      return;
    }

    setProfilePicture(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.delete(`${backendURL}/api/user/remove-profile-picture/${admin.id}`, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        updateAdmin({
          ...admin,
          profilePicture: null,
        });
        setProfilePicture(null);
        setImagePreview(null);
        document.getElementById('profilePicture').value = null;
        setError('Profile picture removed successfully');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.data.message || 'Failed to remove profile picture');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove profile picture');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
      setShowRemoveConfirm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name || !email) {
      setError('Name and email are required');
      setIsLoading(false);
      return;
    }

    // Check if there are any changes
    const nameChanged = name !== admin.name;
    const emailChanged = email !== admin.email;
    const passwordChanged = !!password;
    const imageChanged = !!profilePicture;
    
    if (!nameChanged && !emailChanged && !passwordChanged && !imageChanged) {
      setError('No changes detected');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    try {
      const response = await axios.put(`${backendURL}/api/user/update/${admin.id}`, formData, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      if (response.data.success) {
        updateAdmin({
          ...admin,
          name: response.data.admin.name,
          email: response.data.admin.email,
          profilePicture: response.data.admin.profilePicture || null,
        });
        setError('Profile updated successfully');
        setPassword('');
        setProfilePicture(null);
        setImagePreview(response.data.admin.profilePicture || null);
        document.getElementById('profilePicture').value = null;
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update profile');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-lg mx-auto w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Admin Profile</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">Update your profile details</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-4 sm:p-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-full overflow-hidden border-2 border-orange-400 flex items-center justify-center bg-red-600">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/150x150/gray/white?text=A';
                    e.target.style.display = 'block';
                  }}
                />
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {admin.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(true)}
                  disabled={isLoading}
                  className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500/80 text-white rounded-full p-1 sm:p-1.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-xs sm:text-sm backdrop-blur-sm ${error.includes('successfully') ? 'bg-green-900/30 border border-green-700/50 text-green-200' : 'bg-red-900/30 border border-red-700/50 text-red-200'}`}>
              <div className="flex items-center">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={error.includes('successfully') ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}></path>
                </svg>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300">
                New Password (optional)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Enter new password"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profilePicture" className="block text-xs sm:text-sm font-medium text-gray-300">
                Profile Picture (max 250KB)
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="profilePicture" className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-600/50 rounded-xl cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-all duration-300">
                  <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-5 sm:pb-6">
                    <svg className="w-6 sm:w-8 h-6 sm:h-8 mb-2 sm:mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG (MAX. 250KB)</p>
                  </div>
                  <input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-4 sm:p-6 max-w-sm w-full">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-white">Remove Profile Picture</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-300">Are you sure you want to remove your profile picture?</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveProfilePicture}
                disabled={isLoading}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Removing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;