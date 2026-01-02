import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './slices/auth/authSlice';
import Login from './slices/auth/Login';
import Register from './slices/auth/Register';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import CartPage from './components/CartPage';
import SuccessPage from './components/SuccessPage';
import MyOrders from './components/MyOrders';
import LoginSuccess from './slices/auth/LoginSuccess';

import './App.css';

function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check status if token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-wrapper">
        {isAuthenticated && <Navbar />}

        <main className="container">
          <Routes>
            {/* ✅ MOVE THIS HERE: Accessible to everyone */}
            <Route path="/login-success" element={<LoginSuccess />} />

            {!isAuthenticated ? (
              // 🔓 AUTHENTICATION VIEW
              <Route 
                path="*" 
                element={
                  <div className="auth-wrapper">
                    <div className="auth-card">
                      {isLoginView ? (
                        <Login onSwitch={() => setIsLoginView(false)} />
                      ) : (
                        <Register onSwitch={() => setIsLoginView(true)} />
                      )}
                    </div>
                  </div>
                } 
              />
            ) : (
              // 🔐 PROTECTED APP VIEW
              <>
                <Route path="/" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/edit-product/:id" element={<EditProduct />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/my-orders" element={<MyOrders />} />
                {/* Fallback for logged in users */}
                <Route path="*" element={<ProductList />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;