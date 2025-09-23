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
      let updatedOrder = { ...response.data };
      // Validate and set initial timestamp if invalid
      if (updatedOrder.trackingUpdates.length > 0) {
        updatedOrder.trackingUpdates = updatedOrder.trackingUpdates.map(update => ({
          ...update,
          timestamp: isNaN(new Date(update.timestamp).getTime()) ? new Date() : new Date(update.timestamp)
        }));
      }
      // Mock additional tracking updates with proper dates
      if (updatedOrder.trackingUpdates.length === 1) {
        const now = new Date();
        updatedOrder.trackingUpdates.push({
          status: "Shiped",
          timestamp: now,
          location: "Warehouse"
        });
        updatedOrder.trackingUpdates.push({
          status: "Out for Delivery",
          timestamp: new Date(now.getTime() + 86400000), // 24 hours from now
          location: "Local Post"
        });
      }
      setOrder(updatedOrder);
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    }
  };

  const handleBack = () => {
    navigate('/home', { replace: true });
  };

  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!order) return <div className="container mt-5">Loading...</div>;

  // Determine progress step based on status
  const getProgressStep = (status) => {
    const steps = ['Order Placed', 'Shiped', 'Out for Delivery', 'Delivered'];
    return steps.indexOf(status) !== -1 ? steps.indexOf(status) : 0;
  };

  const steps = ['Order Placed', 'Shiped', 'Out for Delivery', 'Delivered'];
  const currentStep = getProgressStep(order.status);

  // Format date with fallback
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <button
              className="btn p-0 m-0 text-primary"
              onClick={() => navigate('/home')}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              EasyBazaar
            </button>
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-secondary" onClick={handleBack}>Back to Home</button>
          </div>
        </div>
      </header>

      {/* Order Tracking Content */}
      <div className="container mt-5">
        <div className="card shadow-sm p-4">
          <h2 className="text-primary mb-4">Order Tracking</h2>
          <div className="card-body">
            <div className="row">
              <div className="col-12 mb-4">
                <div className="order-details">
                  <h5 className="text-muted">Order Details</h5>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Status:</strong> <span className="badge bg-success">{order.status}</span></p>
                  <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                  <p><strong>Address:</strong> {order.address}</p>
                </div>
              </div>
              <div className="col-12">
                <h5 className="text-muted">Tracking Progress</h5>
                <div className="progress-tracker">
                  {steps.map((step, index) => (
                    <div key={index} className="progress-step">
                      <div
                        className={`step-circle ${index <= currentStep ? 'active' : ''}`}
                      >
                        {index <= currentStep ? <i className="bi bi-check-lg"></i> : index + 1}
                      </div>
                      <div className={`step-label ${index <= currentStep ? 'active' : ''}`}>
                        {step}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`step-line ${index < currentStep ? 'active' : ''}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12 mt-4">
                <h5 className="text-muted">Tracking History</h5>
                <div className="timeline">
                  {order.trackingUpdates.map((update, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <p><strong>{update.status}</strong> - {formatDate(update.timestamp)}</p>
                        <p className="text-muted">{update.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .order-details p { margin-bottom: 0.5rem; }
        .progress-tracker {
          display: flex;
          justify-content: space-between;
          position: relative;
          padding: 20px 0;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 25%;
          text-align: center;
        }
        .step-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        .step-circle.active {
          background-color: #0d6efd;
          color: white;
        }
        .step-label {
          margin-top: 5px;
          font-size: 0.9rem;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        .step-label.active {
          color: #0d6efd;
          font-weight: 500;
        }
        .step-line {
          position: absolute;
          height: 2px;
          background-color: #e9ecef;
          top: 15px;
          width: 75%;
          left: 12.5%;
          transition: all 0.3s ease;
        }
        .step-line.active {
          background-color: #0d6efd;
        }
        .timeline {
          position: relative;
          padding-left: 20px;
        }
        .timeline-item {
          display: flex;
          margin-bottom: 20px;
        }
        .timeline-dot {
          width: 10px;
          height: 10px;
          background-color: #0d6efd;
          border-radius: 50%;
          position: absolute;
          left: 0;
          top: 5px;
        }
        .timeline-content {
          margin-left: 20px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
          border-left: 2px solid #0d6efd;
        }
        @media (max-width: 768px) {
          .progress-tracker { flex-direction: column; align-items: center; }
          .progress-step { width: 100%; margin-bottom: 20px; }
          .step-line { display: none; }
          .timeline-dot { left: -5px; }
        }
      `}</style>
    </div>
  );
}

export default OrderTracking;
