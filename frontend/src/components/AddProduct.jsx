import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert strings to numbers for the backend
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity)
      };
      
      await API.post('/products', dataToSend);
      alert('Product created successfully!');
      navigate('/'); // Go back to product list
    } catch (err) {
      console.error(err);
      alert('Error creating product');
    }
  };

  return (
    <div className="form-container">
    <h2>Add New Product</h2>
    <form className="product-form" onSubmit={handleSubmit}>
      
      {/* Product Name */}
      <div className="form-group">
        <label>Product Name</label>
        <input 
          type="text" 
          placeholder="e.g. Wireless Gaming Mouse" 
          required
        />
      </div>
  
      {/* Description */}
      <div className="form-group">
        <label>Description</label>
        <textarea 
          placeholder="Enter a detailed description..." 
          rows="4"
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
        />
      </div>
  
      {/* Image URL */}
      <div className="form-group">
        <label>Image URL</label>
        <input 
          type="text" 
          placeholder="https://images.unsplash.com/..." 
        />
      </div>
  
      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">Save Product</button>
        <Link to="/" className="btn-cancel">Cancel</Link>
      </div>
  
    </form>
  </div>
  );
};

export default AddProduct;