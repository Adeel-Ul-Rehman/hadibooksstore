import React, { createContext, useState, useEffect, useContext } from 'react';
import "../toastStyles.css";
import { AppContext } from './AppContext';
import { toast } from 'react-toastify';

export const ShopContext = createContext();

const TAX_RATE = 0.00;
const SHIPPING_FEE = 99;

const ShopContextProvider = ({ children }) => {
  const { user, apiRequest, setUser } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currency] = useState('Rs.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.id) {
      const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      setWishlistItems(localWishlist.map(id => ({ productId: id })));
      setCartItems(localCart);
    } else {
      fetchWishlist();
      fetchCart();
    }
  }, [user]);

  const fetchProducts = async (category = '', search = '', bestseller = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (bestseller) params.append('bestseller', 'true');
      params.append('page', '1');
      params.append('limit', '10000'); // Fetch ALL products (high limit to get everything)

      const data = await apiRequest('get', `/api/products/get?${params.toString()}`);
      if (data.success) {
        const productsWithSubCategories = data.products.map(product => ({
          ...product,
          subCategories: product.subCategories || [],
        }));
        setProducts(productsWithSubCategories || []);
        console.log(`✅ Fetched ${productsWithSubCategories.length} products from database`);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch Products Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      const data = await apiRequest('get', `/api/cart/get/${user.id}`);
      if (data.success) {
        setCartItems(data.cart?.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Fetch Cart Error:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      const data = await apiRequest('get', `/api/wishlist/get/${user.id}`);
      if (data.success) {
        setWishlistItems(data.wishlist?.items || []);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Fetch Wishlist Error:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, format = null, quantity = 1) => {
    let prevCartItems = [...cartItems];
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Product not found');
        return false;
      }

      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const existingItemIndex = localCart.findIndex(item => 
          item.productId === productId && item.format === format
        );
        let updatedCart;
        if (existingItemIndex > -1) {
          localCart[existingItemIndex].quantity += quantity;
          updatedCart = [...localCart];
        } else {
          updatedCart = [
            ...localCart,
            {
              productId,
              format,
              quantity,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              category: product.category,
            },
          ];
        }
        setCartItems(updatedCart);
        setTimeout(() => {
          localStorage.setItem('localCart', JSON.stringify(updatedCart));
        }, 0);
        return true;
      }

      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(item => item.productId === productId && item.format === format);
        if (existingItemIndex > -1) {
          const updated = [...prev];
          updated[existingItemIndex].quantity += quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              productId,
              format,
              quantity,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              category: product.category,
            },
          ];
        }
      });
      apiRequest('post', '/api/cart/add', { productId, quantity })
        .then(data => {
          if (data.success) fetchCart();
        })
        .catch(error => {
          setCartItems(prevCartItems);
          console.error('Add to Cart Error:', error);
        });
      return true;
    } catch (error) {
      console.error('Add to Cart Error:', error);
      setCartItems(prevCartItems);
      return false;
    }
  };

  const removeFromCart = async (productId, format = null) => {
    let prevCartItems = [...cartItems];
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.filter(item => 
          !(item.productId === productId && item.format === format)
        );
        setCartItems([...updatedCart]);
        setTimeout(() => {
          localStorage.setItem('localCart', JSON.stringify(updatedCart));
        }, 0);
        return true;
      }

      setCartItems(prev => prev.filter(item => !(item.productId === productId && item.format === format)));
      apiRequest('delete', '/api/cart/remove', { productId })
        .then(data => {
          if (data.success) fetchCart();
        })
        .catch(error => {
          setCartItems(prevCartItems);
          console.error('Remove from Cart Error:', error);
        });
      return true;
    } catch (error) {
      console.error('Remove from Cart Error:', error);
      setCartItems(prevCartItems);
      return false;
    }
  };

  const updateCart = async (productId, format = null, quantity) => {
    let prevCartItems = [...cartItems];
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.map(item =>
          item.productId === productId && item.format === format ? { ...item, quantity } : item
        );
        setCartItems([...updatedCart]);
        setTimeout(() => {
          localStorage.setItem('localCart', JSON.stringify(updatedCart));
        }, 0);
        return true;
      }

      setCartItems(prev => prev.map(item =>
        item.productId === productId && item.format === format ? { ...item, quantity } : item
      ));
      apiRequest('put', '/api/cart/update', { productId, quantity })
        .then(data => {
          if (data.success) fetchCart();
        })
        .catch(error => {
          setCartItems(prevCartItems);
          console.error('Update Cart Error:', error);
        });
      return true;
    } catch (error) {
      console.error('Update Cart Error:', error);
      setCartItems(prevCartItems);
      return false;
    }
  };

  const toggleWishlistItem = async (productId) => {
    let prevWishlistItems = [...wishlistItems];
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Product not found');
        return false;
      }

      if (!user) {
        const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
        let updatedWishlist;
        if (localWishlist.includes(productId)) {
          updatedWishlist = localWishlist.filter(id => id !== productId);
        } else {
          if (localWishlist.length >= 10) {
            toast.error('Wishlist is full');
            return false;
          }
          updatedWishlist = [...localWishlist, productId];
        }
        setWishlistItems(updatedWishlist.map(id => ({ productId: id })));
        setTimeout(() => {
          localStorage.setItem('localWishlist', JSON.stringify(updatedWishlist));
        }, 0);
        return true;
      }

      const isInWishlist = wishlistItems.some(item => item.productId === productId);
      if (isInWishlist) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        apiRequest('delete', '/api/wishlist/remove', { productId })
          .then(data => {
            if (data.success) fetchWishlist();
          })
          .catch(error => {
            setWishlistItems(prevWishlistItems);
            console.error('Toggle Wishlist Error:', error);
          });
        return true;
      } else {
        setWishlistItems(prev => [...prev, { productId }]);
        apiRequest('post', '/api/wishlist/add', { productId })
          .then(data => {
            if (data.success) fetchWishlist();
          })
          .catch(error => {
            setWishlistItems(prevWishlistItems);
            console.error('Toggle Wishlist Error:', error);
          });
        return true;
      }
    } catch (error) {
      setWishlistItems(prevWishlistItems);
      console.error('Toggle Wishlist Error:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    let prevWishlistItems = [...wishlistItems];
    try {
      if (!user) {
        const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
        const updatedWishlist = localWishlist.filter(id => id !== productId);
        setWishlistItems(updatedWishlist.map(id => ({ productId: id })));
        setTimeout(() => {
          localStorage.setItem('localWishlist', JSON.stringify(updatedWishlist));
        }, 0);
        return true;
      }

      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      apiRequest('delete', '/api/wishlist/remove', { productId })
        .then(data => {
          if (data.success) fetchWishlist();
        })
        .catch(error => {
          setWishlistItems(prevWishlistItems);
          console.error('Remove from Wishlist Error:', error);
        });
      return true;
    } catch (error) {
      setWishlistItems(prevWishlistItems);
      console.error('Remove from Wishlist Error:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const getCartTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      const price = product ? product.price : item.price || 0;
      return total + price * item.quantity;
    }, 0);
    const taxes = subtotal * TAX_RATE;
    const total = subtotal + taxes + SHIPPING_FEE;
    return total.toFixed(2);
  };

  const getProductReviews = async (productId, page = 1, limit = 10) => {
    try {
      const data = await apiRequest('get', `/api/reviews/product/${productId}?page=${page}&limit=${limit}`);
      if (data.success) {
        return {
          reviews: data.reviews || [],
          pagination: data.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
          averageRating: data.averageRating || 0,
        };
      } else {
        return { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 }, averageRating: 0 };
      }
    } catch (error) {
      console.error('Fetch Reviews Error:', error);
      return { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 }, averageRating: 0 };
    }
  };

  const uploadPaymentProof = async (orderId, file) => {
    setLoading(true);
    if (!orderId || !file) {
      setLoading(false);
      return { success: false, message: 'Order ID and proof file are required' };
    }

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('proof', file);

    try {
      const data = await apiRequest('post', '/api/checkout/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error) {
      console.error('Upload Payment Proof Error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to upload payment proof' };
    } finally {
      setLoading(false);
    }
  };

  const calculateCheckout = async (items) => {
    try {
      const data = await apiRequest('post', '/api/checkout/calculate', { 
        items,
        taxes: items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) * TAX_RATE,
        shippingFee: SHIPPING_FEE,
      });
      return data;
    } catch (error) {
      console.error('Calculate Checkout Error:', error);
      return { success: false, message: 'Failed to calculate checkout totals' };
    }
  };

  const processCheckout = async (checkoutData) => {
    try {
      const { paymentMethod, onlinePaymentOption, ...rest } = checkoutData;
      const payload = {
        ...rest,
        paymentMethod,
        onlinePaymentOption: paymentMethod === 'online' ? onlinePaymentOption : undefined,
        taxes: rest.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) * TAX_RATE,
        shippingFee: SHIPPING_FEE,
      };
      
      console.log('📤 ShopContext sending to /api/checkout/process:', JSON.stringify(payload, null, 2));
      
      const data = await apiRequest('post', '/api/checkout/process', payload);
      if (data.success) {
        setCartItems([]); // Clear cart items on successful checkout
        localStorage.removeItem("localCart"); // Clear local storage cart
      }
      return data;
    } catch (error) {
      console.error('Process Checkout Error:', error);
      return { success: false, message: 'Failed to process checkout' };
    }
  };

  const fetchHeroImages = async () => {
    try {
      const data = await apiRequest('get', '/api/hero/');
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Fetch Hero Images Error:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return (
    <ShopContext.Provider
      value={{
        products,
        cartItems,
        setCartItems,
        wishlistItems,
        currency,
        addToCart,
        removeFromCart,
        updateCart,
        toggleWishlistItem,
        removeFromWishlist,
        isInWishlist,
        getCartCount,
        getWishlistCount,
        getProductReviews,
        getCartTotal,
        fetchProducts,
        fetchCart,
        fetchWishlist,
        loading,
        processCheckout,
        uploadPaymentProof,
        calculateCheckout,
        TAX_RATE,
        SHIPPING_FEE,
        fetchHeroImages,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;