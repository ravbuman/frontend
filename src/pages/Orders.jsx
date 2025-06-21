import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, 
  FiPackage, 
  FiTruck, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'Pending', label: 'Pending', color: 'orange' },
    { value: 'Shipped', label: 'Shipped', color: 'purple' },
    { value: 'Delivered', label: 'Delivered', color: 'green' },
    { value: 'Cancelled', label: 'Cancelled', color: 'red' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount-high', label: 'Amount: High to Low' },
    { value: 'amount-low', label: 'Amount: Low to High' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, statusFilter, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/products/orders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch orders');
        }
      }
    } catch (error) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.placedAt || a.createdAt) - new Date(b.placedAt || b.createdAt);
        case 'amount-high':
          return (b.totalAmount || b.total) - (a.totalAmount || a.total);
        case 'amount-low':
          return (a.totalAmount || a.total) - (b.totalAmount || b.total);
        case 'newest':
        default:
          return new Date(b.placedAt || b.createdAt) - new Date(a.placedAt || a.createdAt);
      }
    });

    setFilteredOrders(filtered);
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'Shipped':
        return <FiTruck className="w-5 h-5 text-purple-500" />;
      case 'Cancelled':
        return <FiX className="w-5 h-5 text-red-500" />;
      case 'Pending':
      default:
        return <FiClock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Pending':
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };
  const getStatusMessage = (status) => {
    switch (status) {
      case 'Pending':
        return {
          title: 'Order Placed Successfully!',
          message: 'We\'ve received your order and are preparing it for shipment.'
        };
      case 'Shipped':
        return {
          title: 'Your Order is On Its Way!',
          message: 'Your package has been shipped and is en route to your address.'
        };
      case 'Delivered':
        return {
          title: 'Order Delivered Successfully!',
          message: 'Your order has been delivered. We hope you love your purchase!'
        };
      case 'Cancelled':
        return {
          title: 'Order Cancelled',
          message: 'This order has been cancelled. Refund will be processed if applicable.'
        };
      default:
        return {
          title: 'Order Status',
          message: 'Your order is being processed.'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex justify-center items-center">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex justify-center items-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filter by Status:</span>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === option.value
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FiShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          Order #{order._id.slice(-8)}
                        </h3>
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          {getStatusMessage(order.status).title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getStatusMessage(order.status).message}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiShoppingCart className="w-4 h-4" />
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiDollarSign className="w-4 h-4" />
                          Payment: {order.paymentStatus || 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center gap-6">                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">₹{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <FiEye className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FiPackage className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Items in this order:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">                      {order.items.slice(0, 3).map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
                        >
                          {item.name || 'Product'} × {item.qty || item.quantity || 1}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {statusFilter === 'all' ? 'No Orders Yet' : `No ${statusFilter} Orders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!" 
                : `You don't have any ${statusFilter} orders at the moment.`
              }
            </p>
            {statusFilter === 'all' ? (
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
              >
                Start Shopping
              </button>
            ) : (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                View All Orders
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Orders;
