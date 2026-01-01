import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../slices/products/productSlice';
import { addToCart } from '../slices/cart/cartSlice'; // Import the action

const ProductList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth); // Get logged-in user

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    alert(`${product.name} added to cart!`); // Simple feedback for now
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-grid">
      {items.map((product) => (
     <div key={product.id} className="product-card">
     <div className="image-container">
       <img src={product.image_url || 'placeholder.jpg'} alt={product.name} />
       {product.stock_quantity < 5 && <span className="badge">Low Stock</span>}
     </div>
     
     <div className="product-details">
       <h3 className="product-title">{product.name}</h3>
       <p className="product-description">{product.description}</p>
       <div className="price-row">
         <span className="product-price">${product.price}</span>
         <span className="stock-count">{product.stock_quantity} left</span>
       </div>
     </div>
   
     <div className="product-actions">
       <button className="btn-primary" onClick={() => handleAddToCart(product)}>Add to Cart</button>
       
       {user?.is_admin && (
         <div className="admin-controls">
           <Link to={`/edit-product/${product.id}`} className="btn-edit">Edit</Link>
           <button onClick={() => handleDelete(product.id)} className="btn-delete">Delete</button>
         </div>
       )}
     </div>
   </div>
         
      ))}
    </div>
  );
};

export default ProductList;