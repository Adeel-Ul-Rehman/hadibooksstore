import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../App';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [admin, setAdmin] = useState({
    token: '',
    id: null,
    name: '',
    email: '',
    profilePicture: '',
  });

  const [heroImages, setHeroImages] = useState([]);

  const fetchHeroImages = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        console.log('No admin token found for hero images');
        return;
      }
      
      const response = await axios.get(`${backendURL}/api/adminCtrl/hero/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setHeroImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error.response?.data?.message || error.message);
    }
  };

  const toggleHeroImageAvailability = async (id) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }
      
      const response = await axios.patch(`${backendURL}/api/adminCtrl/hero/toggle-availability/${id}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        await fetchHeroImages();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error toggling hero image availability:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to toggle availability' };
    }
  };

  const addHeroImage = async (formData) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.post(`${backendURL}/api/adminCtrl/hero/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        await fetchHeroImages();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error adding hero image:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to add hero image' };
    }
  };

  const updateHeroImage = async (id, formData) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }
      
      const response = await axios.put(`${backendURL}/api/adminCtrl/hero/update/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        await fetchHeroImages();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error updating hero image:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to update hero image' };
    }
  };

  const deleteHeroImage = async (id) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }
      
      const response = await axios.delete(`${backendURL}/api/adminCtrl/hero/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        await fetchHeroImages();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error deleting hero image:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to delete hero image' };
    }
  };

  const fetchAdminProfile = async (retryCount = 3) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      console.log('No admin token found');
      return;
    }

    try {
      const response = await axios.get(`${backendURL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.success) {
        const { id, name, email, profilePicture } = response.data.admin;
        const adminData = { token, id, name, email, profilePicture: profilePicture || '' };
        setAdmin(adminData);
        sessionStorage.setItem('admin', JSON.stringify(adminData));
      } else {
        console.error('Failed to fetch admin profile:', response.data.message);
        updateAdmin({ token: '', id: null, name: '', email: '', profilePicture: '' });
        sessionStorage.removeItem('admin');
        sessionStorage.removeItem('adminToken');
      }
    } catch (err) {
      console.error('Fetch admin profile error:', err.response?.data?.message || err.message);
      if ((err.response?.status === 401 || err.response?.status === 403) && retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAdminProfile(retryCount - 1);
      }
      if (err.response?.status === 401 || err.response?.status === 403) {
        updateAdmin({ token: '', id: null, name: '', email: '', profilePicture: '' });
        sessionStorage.removeItem('admin');
        sessionStorage.removeItem('adminToken');
      }
      throw new Error(err.response?.data?.message || 'Failed to fetch profile');
    }
  };

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem('admin');
    const storedToken = sessionStorage.getItem('adminToken');
    
    if (storedAdmin && storedToken) {
      const adminData = JSON.parse(storedAdmin);
      adminData.token = storedToken;
      setAdmin(adminData);
      fetchAdminProfile().catch((err) => {
        console.error('Initial profile fetch failed:', err.message);
      });
    }
  }, []);

  const updateAdmin = (adminData) => {
    setAdmin(adminData);
    if (adminData.token && adminData.id) {
      sessionStorage.setItem('admin', JSON.stringify(adminData));
      sessionStorage.setItem('adminToken', adminData.token);
    } else {
      sessionStorage.removeItem('admin');
      sessionStorage.removeItem('adminToken');
    }
  };

  return (
    <AppContext.Provider value={{ 
      admin, 
      updateAdmin, 
      fetchAdminProfile,
      heroImages,
      fetchHeroImages,
      addHeroImage,
      toggleHeroImageAvailability,
      updateHeroImage,
      deleteHeroImage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
