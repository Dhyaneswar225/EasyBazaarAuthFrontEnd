import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState([]); // State to hold product details
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const userId = "guest"; // Static userId

  useEffect(() => {
    fetchCartAndProducts();
  }, []);

  const fetchCartAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch cart
      const cartResponse = await fetch(`http://localhost:8080/api/cart/${userId}`);
      if (!cartResponse.ok) throw new Error('Failed to fetch cart');
      const cartData = await cartResponse.json();
      setCart(cartData || { items: [] });

      // Fetch all products to map productIds to names
      const productsResponse = await fetch(`http://localhost:8080/api/products`);
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const productsData = await productsResponse.json();
      setProducts(productsData || []);

    } catch (err) {
      setError('Failed to load data: ' + err.message);
      setCart({ items: [] });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items: [{ productId, quantity: 1, price: 0 }] }),
      });
      if (response.ok) {
        fetchCartAndProducts();
        alert('Item removed from cart!');
      } else {
        throw new Error(`Failed to remove item from cart: ${response.statusText}`);
      }
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error(err);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

  if (loading) return <div className="container mt-5">Loading cart...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header with EasyBazaar icon */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <div className="container d-flex align-items-center justify-content-start">
          <button
            className="btn p-0 m-0 text-primary me-2"
            onClick={() => navigate('/home')}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            EasyBazaar
          </button>
        </div>
      </header>

      {/* Cart Content */}
      <div className="container mt-5 mb-5">
        <h4 className="mb-3">Your Cart ({cart.items.length} items)</h4>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : cart.items.length > 0 ? (
          <div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, index) => (
                    <tr key={index}>
                      <td>{getProductName(item.productId)}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4"><strong>Total</strong></td>
                    <td><strong>${cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              className="btn btn-success w-100 mt-3"
              onClick={() => navigate('/cart-checkout', { state: { cart } })}
              disabled={cart.items.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        ) : (
          <p className="text-center text-muted">Your cart is empty.</p>
        )}
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/home')}>
          Back to Shopping
        </button>
      </div>
    </div>
  );
}

export default Cart;