import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../slices/cart/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CartPage = () => {
    const dispatch = useDispatch();
    const { items } = useSelector((state) => state.cart);
    const user = useSelector((state) => state.auth.user); // Retrieve user from auth state
    console.log("Full Cart State in Page:", items);
    console.log("Items to map:", items);
  // Calculate Subtotal
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const navigate = useNavigate();
  
  const handleCheckout = async () => {
    const orderData = {
      userId: user?.id, // Safely access user ID
      items: items,    // The cart items
      totalPrice: subtotal
    };
  
    try {
        console.log("Order Data:", orderData);
        await API.post('/orders', orderData);
        alert("🎉 Order placed successfully!");
        dispatch(clearCart()); // Empty the cart
        // Navigate to an "Orders History" page with the order data
        navigate('/success', { state: { order: data.order } });
    
    } catch (error) {
      console.error("Checkout failed", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn-primary">Go Shopping</Link>
      </div>
    );
  }



  return (
    <div className="cart-container">
      <h1>Your Shopping Cart</h1>
      <div className="cart-layout">
        {/* List of Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item-card">
              <img src={item.image_url} alt={item.name} />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">${item.price}</p>
                <div className="quantity-controls">
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
                </div>
              </div>
              <button className="remove-btn" onClick={() => dispatch(removeFromCart(item.id))}>×</button>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}> Proceed to Checkout</button>
          <button className="clear-btn" onClick={() => dispatch(clearCart())}>Clear Cart</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;