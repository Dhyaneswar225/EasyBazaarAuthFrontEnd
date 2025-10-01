import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, getProducts } from '../services/api';

// Example: Assuming an AuthContext for user authentication
const AuthContext = React.createContext();

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({}); // Map of productId to name
  const auth = useContext(AuthContext); // Get auth context
  const userId = auth?.user?.id || localStorage.getItem('userId') || 'guest'; // Dynamic userId

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products first to build the mapping
        const productsResponse = await getProducts();
        const productMap = productsResponse.data.reduce((map, product) => {
          map[product.id] = product.name; // Assuming product has id and name fields
          return map;
        }, {});
        setProducts(productMap);

        const response = await getOrders(userId);
        if (!response.data) {
          setOrders([]);
        } else {
          setOrders(response.data);
        }
      } catch (err) {
        setError(`Failed to load data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]); // Re-run effect if userId changes

  const getLatestTimestamp = (trackingUpdates) => {
    if (!trackingUpdates || trackingUpdates.length === 0) {
      return null;
    }
    const latestUpdate = trackingUpdates.reduce((latest, update) => {
      const currentDate = new Date(update.timestamp.replace('IST', '+0530'));
      const latestDate = new Date(latest.timestamp.replace('IST', '+0530'));
      return currentDate > latestDate ? update : latest;
    });
    return latestUpdate.timestamp;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const normalizedTimestamp = timestamp.replace('IST', '+0530');
    const date = new Date(normalizedTimestamp);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const getItemNames = (items) => {
    if (!items || items.length === 0) return ['No items'];
    return items.map(item => products[item.productId] || item.productId);
  };

  const getQuantities = (items) => {
    if (!items || items.length === 0) return ['-'];
    return items.map(item => item.quantity);
  };

  if (loading) return <div className="container mt-5">Loading orders...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <div className="container d-flex align-items-center justify-content-start">
          <button
            className="btn p-0 m-0 text-primary me-2"
            onClick={() => navigate('/home')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            EasyBazaar
          </button>
        </div>
      </header>

      {/* Orders Content */}
      <div className="container mt-5 mb-5">
        <h4 className="mb-3">My Orders</h4>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : orders.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .sort((a, b) => {
                    const dateA = new Date(getLatestTimestamp(a.trackingUpdates).replace('IST', '+0530'));
                    const dateB = new Date(getLatestTimestamp(b.trackingUpdates).replace('IST', '+0530'));
                    return dateB - dateA; // Descending order
                  })
                  .flatMap((order) =>
                    getItemNames(order.items).map((itemName, index) => (
                      <tr key={`${order.id}-${index}`}>
                        <td>{order.id}</td>
                        <td>{formatDate(getLatestTimestamp(order.trackingUpdates))}</td>
                        <td>{itemName}</td>
                        <td>{getQuantities(order.items)[index]}</td>
                        <td>${order.total?.toFixed(2) || 'N/A'}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/order-tracking', { state: { orderId: order.id } })}
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted">No orders found.</p>
        )}
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default MyOrders;