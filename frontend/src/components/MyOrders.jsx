import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUserOrders } from '../slices/orders/orderSlices';
import './MyOrders.css';

const MyOrders = () => {
  const dispatch = useDispatch();
  
  // Destructure with default values to prevent "undefined" errors
  const { orders = [], loading = false, error = null } = useSelector((state) => state.orders || {});

  useEffect(() => {
    dispatch(fetchAllUserOrders());
  }, [dispatch]);

  if (loading) return <div className="status-msg">Loading...</div>;
  if (error) return <div className="status-msg error">Error: {error}</div>;

  return (
    <div className="orders-wrapper">
      <header className="orders-header">
        <h1>Order History</h1>
      </header>

      <div className="orders-list">
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => {
            // Safe Data Parsing
            const date = order.created_at || order.order_date || new Date().toISOString();
            const total = order.total_price || order.total_amount || 0;
            
            let items = [];
            try {
              items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
            } catch (e) { items = []; }

            return (
              <div key={order.id} className="order-card-premium">
                <div className="order-card-header">
                  <div>
                    <p className="label">DATE</p>
                    <p>{new Date(date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="label">TOTAL</p>
                    <p>${Number(total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="label">STATUS</p>
                    <span className={`pill ${order.status?.toLowerCase()}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  {items.map((item, idx) => (
                    <div key={idx} className="item-row">
                     <img 
  // 1. Try the database image
  // 2. Fallback to a local image in your /public folder if you have one
  // 3. Otherwise, use a highly reliable CDN like Unsplash or a simple Div
  src={item.image_url || item.image || 'https://images.unsplash.com/photo-1580910051074-3eb6948865c5?w=50&h=50&fit=crop'} 
  alt={item.name} 
  className="mini-thumb"
  onError={(e) => { 
    // If the image fails to load, hide the broken icon and show a background color
    e.target.style.display = 'none'; 
    e.target.parentElement.style.backgroundColor = '#e2e8f0';
  }}
/>
                      <span>{item.name} (x{item.quantity})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default MyOrders;