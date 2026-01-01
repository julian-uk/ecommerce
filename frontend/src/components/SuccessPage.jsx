import { Link, useLocation } from 'react-router-dom';
import './SuccessPage.css';

const SuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order; // Retrieve order data passed during navigation

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Thank You!</h1>
        <p>Your order has been placed successfully.</p>
        
        {order && (
          <div className="order-details-mini">
            <p>Order ID: <strong>#{order.id}</strong></p>
            <p>Total Paid: <strong>${order.total_price}</strong></p>
          </div>
        )}

        <div className="success-actions">
          <Link to="/" className="btn-primary">Continue Shopping</Link>
          <Link to="/my-orders" className="btn-secondary">View My Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;