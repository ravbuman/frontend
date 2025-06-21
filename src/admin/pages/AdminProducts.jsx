import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon, 
  LoadingIcon, 
  EmptyIcon, 
  ImageIcon,
  SaveIcon,
  UpdateIcon,
  CloseIcon,
  ProductsIcon
} from '../components/AdminIcons';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const { primary, mode } = useThemeContext();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/products/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images' && formData.images.length > 0) {
          formData.images.forEach(image => {
            formDataToSend.append('images', image);
          });
        } else if (key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (editingProduct) {
        response = await fetch(`http://localhost:5001/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
      } else {
        response = await fetch('http://localhost:5001/api/products/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
      }

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        await fetchProducts();
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save product');
      }    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      images: []
    });
    setShowForm(true);
  };
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          fetchProducts();
          toast.success('Product deleted successfully');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: []
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }  return (
    <>
      <div className="max-w-7xl mx-auto w-full">        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-gray-600 text-base lg:text-lg">
              Manage your store's products with ease
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="neumorphic-button px-6 lg:px-8 py-3 lg:py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 flex items-center justify-center"
          >
            <AddIcon className="w-5 h-5 mr-2" />
            Add New Product
          </button>
        </div>          {/* Product Form */}
          {showForm && (
            <div className="neumorphic-card mb-8 p-4 lg:p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-2 lg:mr-3"></span>
                  <span className="truncate">{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
                </h2>
                <button
                  onClick={resetForm}
                  className="neumorphic-button-small w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:shadow-soft transition-all duration-300 flex-shrink-0"
                >
                  <CloseIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                  {formData.images.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.images.length} image(s) selected
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="neumorphic-button px-6 lg:px-8 py-3 lg:py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <LoadingIcon className="w-5 h-5 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingProduct ? <UpdateIcon className="w-5 h-5 mr-2" /> : <SaveIcon className="w-5 h-5 mr-2" />}
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={resetForm}
                    className="neumorphic-button px-6 lg:px-8 py-3 lg:py-4 rounded-2xl bg-gray-500 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}          {/* Products List */}
          {loading ? (
            <div className="text-center py-12">
              <LoadingIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          ) : (
            <div className="neumorphic-card rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="text-left p-6 font-semibold text-gray-700">Image</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Name</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Category</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Price</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Stock</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="p-6">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-2xl shadow-soft"
                            />
                          )}
                        </td>
                        <td className="p-6 font-semibold text-gray-800">{product.name}</td>
                        <td className="p-6 text-gray-600">{product.category}</td>
                        <td className="p-6 font-semibold text-green-600">₹{product.price}</td>
                        <td className="p-6">
                          <span className={classNames(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            product.stock > 10 ? 'bg-green-100 text-green-700' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(product)}
                              className="neumorphic-button-small px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center"
                            >
                              <EditIcon className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="neumorphic-button-small px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center"
                            >
                              <DeleteIcon className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {products.map((product) => (
                    <div key={product._id} className="neumorphic-card p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20">
                      <div className="flex items-start space-x-4 mb-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-xl shadow-soft flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                          <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-green-600 text-lg">₹{product.price}</span>
                            <span className={classNames(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              product.stock > 10 ? 'bg-green-100 text-green-700' :
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {product.stock} in stock
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 neumorphic-button-small px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                        >
                          <EditIcon className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 neumorphic-button-small px-3 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                        >
                          <DeleteIcon className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {products.length === 0 && (
                <div className="text-center py-16">
                  <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl mb-4">No products found</p>
                  <p className="text-gray-400">Add your first product to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>

      <style jsx>{`
        .neumorphic-card {
          box-shadow: 
            20px 20px 60px rgba(0, 0, 0, 0.05),
            -20px -20px 60px rgba(255, 255, 255, 0.8);
        }
        .neumorphic-button {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.2),
            -8px -8px 16px rgba(255, 255, 255, 0.1);
        }
        .neumorphic-button-small {
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.2),
            -4px -4px 8px rgba(255, 255, 255, 0.1);
        }
        .neumorphic-input {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.05),
            inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
        .shadow-soft {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
        .shadow-soft-lg {
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.1),
            -12px -12px 24px rgba(255, 255, 255, 0.8);        }
      `}</style>
    </>
  );
};

export default AdminProducts; 