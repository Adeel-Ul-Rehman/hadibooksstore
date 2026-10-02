import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { backendURL } from '../App';
import assets from '../assets/assets';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateAdmin, fetchAdminProfile } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${backendURL}/api/user/admin`, {
        email,
        password,
      }, { 
        withCredentials: true 
      });

      if (response.data.success) {
        const { id, name, email, profilePicture } = response.data.admin;
        const token = response.data.token;
        
        updateAdmin({
          token: token,
          id,
          name,
          email,
          profilePicture: profilePicture || '',
        });
        
        await fetchAdminProfile();
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-xs sm:max-w-sm p-4 sm:p-6 bg-gradient-to-b from-black to-gray-900 rounded-xl shadow-2xl border border-orange-600">
        <div className="text-center mb-4">
          <div className="mx-auto bg-sky-100 p-2 rounded-lg shadow-md border border-sky-300 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3">
            <img src={assets.logo} alt="Logo" className="h-full w-auto" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-sky-100">Admin Login</h2>
          <p className="mt-1 text-xs text-orange-300">Access the Hadi Books Store Admin Panel</p>
        </div>

        {error && (
          <div className="bg-red-800 border-red-600 text-white px-3 py-2 rounded-lg text-xs mb-3">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-sky-100 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-sky-100 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 text-sm"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          <div className="text-right">
            <Link
              to="/admin/reset-password"
              className="text-xs text-orange-300 hover:text-orange-400 transition-colors duration-300"
            >
              Forgot Password?
            </Link>
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-3 sm:px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;