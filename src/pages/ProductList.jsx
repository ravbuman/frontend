import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiSearch, 
  FiShoppingCart, 
  FiZap, 
  FiHeart,
  FiFilter,
  FiX,
  FiGrid,
  FiList,
  FiStar,
  FiCheck,
  FiPlus,
  FiMinus
} from 'react-icons/fi';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ProductList = () => {
 const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});  const [wishlistItems, setWishlistItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get('category');

  // Authentication token (you'll need to get this from your auth context/storage)
  const getAuthToken = () => localStorage.getItem('token');

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };
  const fetchWishlistAndCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const [wishlistData, cartData] = await Promise.all([
        apiCall('https://coms-again.onrender.com/api/products/wishlist/me'),
        apiCall('https://coms-again.onrender.com/api/products/cart/me')
      ]);      setWishlist(wishlistData.wishlist || []);
      setWishlistItems(wishlistData.wishlist || []);
      setCart(cartData.cart || []);
    } catch (error) {
      console.log('Not authenticated or error fetching user data');
    }
  }, []);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    
    setLoading(true);
    let url = 'https://coms-again.onrender.com/api/products';
    if (categoryParam) url += `?category=${encodeURIComponent(categoryParam)}`;

    setTimeout(() => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const allProducts = data.products || [];
          setProducts(allProducts);
          setFiltered(allProducts);
          const categories = [...new Set(allProducts.map(p => p.category))];
          setCategoryOptions(categories);

          const prices = allProducts.map(p => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange([min, max]);

          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load products');
          setLoading(false);
        });
    }, 500);

    if (token) {
      fetchWishlistAndCart();
    }
  }, [categoryParam, fetchWishlistAndCart]);

  useEffect(() => {
    let filteredData = products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => selectedCategories.length ? selectedCategories.includes(p.category) : true)
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter(p => {
        if (ratingFilter === 0) return true;
        const avgRating = p.reviews?.length
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
        return avgRating >= ratingFilter;
      });

    // Sorting
    filteredData.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          const avgA = a.reviews?.length ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
          const avgB = b.reviews?.length ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
          return avgB - avgA;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFiltered(filteredData);
  }, [searchQuery, selectedCategories, priceRange, ratingFilter, products, sortBy]);

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const setLoadingState = (productId, action, state) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${productId}-${action}`]: state
    }));
  };

  const getLoadingState = (productId, action) => {
    return loadingStates[`${productId}-${action}`] || false;
  };

  const handleWishlistToggle = async (productId, isInWishlist) => {
    setLoadingState(productId, 'wishlist', true);
    try {
      if (isInWishlist) {
        await apiCall('https://coms-again.onrender.com/api/products/wishlist/remove', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        setWishlist(prev => prev.filter(id => id !== productId));
        showNotification('Removed from wishlist');
      } else {
        await apiCall('https://coms-again.onrender.com/api/products/wishlist/add', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        setWishlist(prev => [...prev, productId]);
        showNotification('Added to wishlist');
      }
    } catch (error) {
      showNotification('Please login to manage wishlist', 'error');
    } finally {
      setLoadingState(productId, 'wishlist', false);
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    setLoadingState(productId, 'cart', true);
    try {
      await apiCall('https://coms-again.onrender.com/api/products/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      
      const existingItem = cart.find(item => item.product === productId);
      if (existingItem) {
        setCart(prev => prev.map(item => 
          item.product === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart(prev => [...prev, { product: productId, quantity }]);
      }
      
      showNotification('Added to cart');
    } catch (error) {
      showNotification('Please login to add to cart', 'error');
    } finally {
      setLoadingState(productId, 'cart', false);
    }
  };

  const handleBuyNow = (productId) => {
    navigate(`/checkout?product=${productId}&quantity=1`);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-gray-500 text-sm ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setRatingFilter(0);
    const prices = products.map(p => p.price);
    setPriceRange([Math.min(...prices), Math.max(...prices)]);
  };

  if (error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  const ProductCard = ({ product }) => {
    const isInWishlist = wishlistItems.includes(product._id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistToggle(product._id, isInWishlist(product._id));
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            {isInWishlist(product._id) ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-red-500"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <FiHeart className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-primary">${product.price}</p>
            <button
              onClick={() => handleAddToCart(product._id)}
              className="p-2 text-primary hover:bg-primary hover:text-white rounded-full transition-colors"
            >
              <FiShoppingCart className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <FiStar
                  key={index}
                  className={`w-4 h-4 ${
                    index < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-1 text-sm text-gray-600">
                ({product.numReviews})
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Notifications */}
      <AnimatePresence>
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`px-4 py-3 rounded-xl shadow-lg ${
                notification.type === 'error' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-emerald-500 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                {notification.message}
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)} 
                className="mr-4 p-2 rounded-xl hover:bg-gray-100 transition-colors" 
                aria-label="Go back"
              >
                <FiArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {categoryParam || 'All Products'}
                </h1>
                <p className="text-sm text-gray-500">{filtered.length} products found</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <FiFilter className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 768) && (
              <motion.div 
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="fixed md:static inset-y-0 left-0 z-30 w-80 md:w-64 bg-white p-6 rounded-xl shadow-lg border space-y-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="md:hidden p-1 rounded hover:bg-gray-100"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      range
                      min={Math.floor(priceRange[0])}
                      max={Math.ceil(priceRange[1])}
                      value={priceRange}
                      onChange={(value) => setPriceRange(value)}
                      trackStyle={[{ backgroundColor: '#10b981' }]}
                      handleStyle={[
                        { borderColor: '#10b981', backgroundColor: '#10b981' }, 
                        { borderColor: '#10b981', backgroundColor: '#10b981' }
                      ]}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Categories</h3>
                  <div className="space-y-2">
                    {categoryOptions.map((cat) => (
                      <motion.label 
                        key={cat} 
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((star) => (
                      <motion.label 
                        key={star} 
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={ratingFilter === star}
                          onChange={() => setRatingFilter(star)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(star)].map((_, i) => (
                            <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-sm text-gray-600">& up</span>
                        </div>
                      </motion.label>
                    ))}
                    <motion.label 
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={ratingFilter === 0}
                        onChange={() => setRatingFilter(0)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">All ratings</span>
                    </motion.label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1 }} 
                    className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-56 bg-gray-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-300 rounded w-1/3 mt-4"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div 
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                layout
              >                {filtered.map((product, index) => {
                  const avgRating = product.reviews?.length
                    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                    : 0;
                  
                  const productIsWishlisted = isInWishlist(product._id);
                  const cartItem = cart.find(item => item.product === product._id);
                  const isInCart = !!cartItem;

                  return (
                    <motion.div 
                      key={product._id} 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div 
                        className={`relative bg-gray-50 cursor-pointer overflow-hidden ${
                          viewMode === 'list' ? 'w-48 h-48' : 'pt-[100%]'
                        }`}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <img 
                          src={product.images?.[0] || '/placeholder.png'} 
                          alt={product.name} 
                          className={`${
                            viewMode === 'list' 
                              ? 'w-full h-full' 
                              : 'absolute top-0 left-0 w-full h-full'
                          } object-contain p-4 group-hover:scale-105 transition-transform duration-300`}
                        />
                        
                        {/* Wishlist Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle(product._id, productIsWishlisted);
                          }}
                          disabled={getLoadingState(product._id, 'wishlist')}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                            productIsWishlisted 
                              ? 'bg-red-500 text-white shadow-lg' 
                              : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <FiHeart className={`w-4 h-4 ${productIsWishlisted ? 'fill-current' : ''}`} />
                        </motion.button>

                        {/* Rating Badge */}
                        {avgRating > 0 && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                            <div className="flex items-center gap-1">
                              <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                        )}

                        {/* Stock Badge */}
                        {product.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Discount Badge */}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute bottom-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="text-xs text-emerald-600 font-medium mb-2 uppercase tracking-wide">
                          {product.category}
                        </div>

                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Rating */}
                        {avgRating > 0 && (
                          <div className="mb-3">
                            {renderRatingStars(avgRating)}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl font-bold text-gray-800">
                            Rs.{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-gray-400 line-through text-lg">
                              Rs.{product.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddToCart(product._id)}
                            disabled={product.stock <= 0 || getLoadingState(product._id, 'cart')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                              isInCart
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                            } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {getLoadingState(product._id, 'cart') ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isInCart ? (
                              <>
                                <FiCheck className="w-4 h-4" />
                                <span className="text-sm">In Cart ({cartItem?.quantity})</span>
                              </>
                            ) : (
                              <>
                                <FiShoppingCart className="w-4 h-4" />
                                <span className="text-sm">Add to Cart</span>
                              </>
                            )}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBuyNow(product._id)}
                            disabled={product.stock <= 0}
                            className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                              product.stock <= 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            <FiZap className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Stock Info */}
                        {product.stock > 0 && product.stock <= 10 && (
                          <div className="mt-3 text-center">
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              Only {product.stock} left in stock
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Floating Action Button for Mobile Filters */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFilters(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <FiFilter className="w-6 h-6" />
      </motion.button>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: window.scrollY > 500 ? 1 : 0,
          y: window.scrollY > 500 ? 0 : 100 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 left-6 w-12 h-12 bg-white text-gray-600 rounded-full shadow-lg flex items-center justify-center z-30 border border-gray-200"
      >
        <FiArrowLeft className="w-5 h-5 rotate-90" />
      </motion.button>
    </div>
  );
};

export default ProductList;