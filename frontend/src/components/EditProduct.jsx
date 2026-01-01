import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProduct } from '../slices/products/productSlice';
import API from '../api/axios';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock_quantity: ''
  });

  // 1. Fetch current data to fill the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setFormData({
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          image_url: res.data.image_url,
          stock_quantity: res.data.stock_quantity
        });
      } catch (err) {
        alert("Could not load product data");
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProduct({ 
      id, 
      updates: { ...formData, price: Number(formData.price), stock_quantity: Number(formData.stock_quantity) } 
    }));
    
    if (!result.error) {
      alert("Product updated!");
      navigate('/');
    }
  };

  return (
    <div className="auth-card">
      <h2>Edit Product</h2> <form className="product-form" onSubmit={handleSubmit}>
      
      {/* Product Name */}
      <div className="form-group">
        <label>Product Name</label>
        <input 
          type="text" 
          placeholder="e.g. Wireless Gaming Mouse" 
          required
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
        />
      </div>
  
      {/* Description */}
      <div className="form-group">
        <label>Description</label>
        <textarea 
          placeholder="Enter a detailed description..." 
          rows="4"
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
        />
      </div>
  
      {/* Price - Fully Justified */}
      <div className="form-group">
        <label>Price ($)</label>
        <input 
          type="number" 
          step="0.01" 
          placeholder="0.00" 
          required
          value={formData.price || ''} 
          onChange={(e) => setFormData({...formData, price: e.target.value})}
        />
      </div>
  
      {/* Stock Quantity - Fully Justified & Numeric */}
      <div className="form-group">
        <label>Stock Quantity</label>
        <input 
          type="number" 
          placeholder="e.g. 50" 
          min="0" 
          required
          value={formData.stock_quantity || ''} 
          onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
        />
      </div>
  
      {/* Image URL */}
      <div className="form-group">
        <label>Image URL</label>
        <input 
          type="text" 
          placeholder="https://images.unsplash.com/..." 
          value={formData.image_url || ''}
          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
        />
      </div>
  
      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">Update Product</button>
        <Link to="/" className="btn-cancel">Cancel</Link>
      </div>
  
    </form>
     
    </div>
  );
};

export default EditProduct;