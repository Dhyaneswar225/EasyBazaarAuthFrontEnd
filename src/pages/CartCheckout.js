import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function CartCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const userId = "guest";
  const address = "123 Street"; // Mock address, replace with user input later

  useEffect(() => {
    const initialCart = location.state?.cart || { items: [] };
    setCart(initialCart);
    fetchProducts();
  }, [location.state]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const productsData = await response.json();
      setProducts(productsData || []);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    }
  };

  const placeOrder = async () => {
    if (cart.items.length === 0) {
      setError('Cart is empty');
      return;
    }
    const order = {
      userId,
      items: cart.items,
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      address,
    };
    try {
      const response = await fetch('http://localhost:8080/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (response.ok) {
        const data = await response.json();
        await fetch(`http://localhost:8080/api/cart/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, items: cart.items }),
        }).catch(err => console.error('Cart clear failed:', err));
        navigate('/order-tracking', { state: { orderId: data.id } });
      } else {
        throw new Error('Failed to place order');
      }
    } catch (err) {
      setError('Failed to place order');
      console.error(err);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

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

      {/* Checkout Content */}
      <div className="container mt-5 mb-5">
        <h4 className="mb-3">Checkout ({cart.items.length} items)</h4>
        {cart.items.length > 0 ? (
          <div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, index) => (
                    <tr key={index}>
                      <td>{getProductName(item.productId)}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="table-light">
                    <td colSpan="2"><strong>Total</strong></td>
                    <td className="text-end">
                      <strong>
                        ${cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mb-3">
              <strong>Shipping Address:</strong> {address}
            </div>
            <button className="btn btn-success w-100 mt-3" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        ) : (
          <p className="text-center text-muted">Cart is empty.</p>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/cart')}>
          Back to Cart
        </button>
      </div>
    </div>
  );
}

export default CartCheckout;
