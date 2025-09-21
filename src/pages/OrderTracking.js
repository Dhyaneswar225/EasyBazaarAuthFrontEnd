import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function OrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = location.state?.orderId;
    if (!orderId) {
      setError('No order ID provided');
      return;
    }
    fetchOrderDetails(orderId);
  }, [location.state]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await getOrderDetails(orderId);
      setOrder(response.data);
      // Mock tracking updates if none exist
      if (response.data.trackingUpdates.length === 1) {
        setOrder(prev => {
          const updatedOrder = { ...prev };
          updatedOrder.trackingUpdates.push({ status: "shipped", timestamp: new Date().toString(), location: "Warehouse" });
          updatedOrder.trackingUpdates.push({ status: "out for delivery", timestamp: new Date(Date.now() + 86400000).toString(), location: "Local Post" });
          return updatedOrder;
        });
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    }
  };

  const handleBack = () => {
    navigate('/home', { replace: true }); // Use replace to avoid back navigation issues
  };

  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!order) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2>Order Tracking</h2>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
      <p><strong>Address:</strong> {order.address}</p>
      <h4>Tracking History</h4>
      <div className="progress" style={{ height: '30px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: order.status === 'delivered' ? '100%' : order.status === 'out for delivery' ? '75%' : order.status === 'shipped' ? '50%' : '25%' }}
          aria-valuenow={order.status === 'delivered' ? 100 : order.status === 'out for delivery' ? 75 : order.status === 'shipped' ? 50 : 25}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {order.status}
        </div>
      </div>
      <ul className="list-group mt-3">
        {order.trackingUpdates.map((update, index) => (
          <li key={index} className="list-group-item">
            <strong>{update.status}</strong> - {update.timestamp} ({update.location})
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary mt-3" onClick={handleBack}>Back to Home</button>
    </div>
  );
}

export default OrderTracking;
