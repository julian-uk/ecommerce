import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const cartItems = useSelector((state) => state.cart.items);
  
  // Calculate total number of items
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        {/* Clicking the logo now takes you back to the products */}
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          🛒 MyStore
        </Link>
        
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-item">Products</Link>
          </li>
          <li><Link to="/add-product" className="nav-item">Add Product</Link></li>
          <li><Link to="/my-orders" className="nav-item">My Orders</Link></li>
      
          
          {user && (
            <li className="user-info">
              Hi, <span>{user.username}</span>
            </li>
          )}
            <Link to="/cart" className="nav-item cart-link">
                🛒 Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;