import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, searchProducts, getCategories, getFeaturedProducts, getCart, placeOrder, getOrders } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [cart, setCart] = useState({ items: [] });
  const [latestOrderId, setLatestOrderId] = useState(null);
  const userId = "guest"; // Static userId
  const address = "123 Street"; // Mock address, replace with user input later

  useEffect(() => {
    fetchInitialData();
  }, [location]); // Re-fetch data when location changes

  const fetchInitialData = async () => {
    try {
      await Promise.all([fetchCategories(), fetchProducts(), fetchFeaturedProducts(), fetchCart(), fetchLatestOrder()]);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchProducts = async (name = '', categoryId = '') => {
    try {
      const response = name
        ? await searchProducts(name)
        : await getProducts();
      const filteredProducts = categoryId
        ? response.data.filter(p => p.categoryId === categoryId)
        : response.data;
      setProducts(filteredProducts);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await getFeaturedProducts();
      setFeaturedProducts(response.data);
    } catch (err) {
      setError('Failed to load featured products');
    }
  };

  const fetchCart = async () => {
    try {
      const response = await getCart(userId);
      const updatedCart = response.data || { items: [] };
      setCart(updatedCart);
      console.log('Cart updated:', updatedCart.items); // Debug log
    } catch (err) {
      setError('Failed to load cart');
      setCart({ items: [] });
    }
  };

  const fetchLatestOrder = async () => {
    try {
      const response = await getOrders(userId); // Assuming an endpoint to get user orders
      if (response.data && response.data.length > 0) {
        const latestOrder = response.data.reduce((latest, current) =>
          new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current
        );
        setLatestOrderId(latestOrder.id);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchTerm, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    fetchProducts(searchTerm, e.target.value);
  };

  const handleLogout = () => {
    navigate('/login'); // Simplified logout
  };

  const addToCart = async (product) => {
    try {
      const response = await fetch(`http://localhost:8080/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: product.id,
          quantity: 1,
          price: product.price,
        }),
      });
      if (response.ok) {
        fetchCart();
        alert('Added to cart!');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (err) {
      setError('Failed to add to cart');
      console.error(err);
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
        fetchCart();
        alert('Item removed from cart!');
      } else {
        throw new Error(`Failed to remove item from cart: ${response.statusText}`);
      }
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error(err);
    }
  };

  const placeOrderHandler = async () => {
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
      const response = await placeOrder(order);
      await fetch(`http://localhost:8080/api/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items: cart.items }),
      }).catch(err => console.error('Cart clear failed:', err));
      await fetchCart();
      navigate('/order-tracking', { state: { orderId: response.data.id } });
    } catch (err) {
      setError('Failed to place order');
      console.error(err);
    }
  };

  // Helper function to get product name by productId
  const getProductName = (productId) => {
    const product = [...products, ...featuredProducts].find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <h2 className="m-0 text-primary">EasyBazaar</h2>
          </div>
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <button className="btn btn-outline-primary me-2" onClick={handleSearch}>
              Search
            </button>
            <button className="btn btn-success me-2 d-flex align-items-center" onClick={() => navigate('/order-tracking', { state: { orderId: latestOrderId } })} disabled={!latestOrderId} style={{ whiteSpace: 'nowrap' }}>
             <i className="bi bi-geo-alt me-2"></i> 
             Track Order
            </button>

            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="container mt-4">
        <div className="position-relative overflow-hidden bg-light rounded-3" style={{ height: '350px' }}>
          <img
            src="https://picsum.photos/1200/350"
            alt="Hero Banner"
            className="w-100 h-100 object-fit-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x350'; }}
          />
          <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
            <h1 className="display-4 fw-bold">Big Sale Up to 50% Off!</h1>
            <p className="lead">Shop now for the best deals.</p>
            <button className="btn btn-warning btn-lg mt-3">Shop Now</button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="container mt-5">
        <h4 className="mb-3">Shop by Category</h4>
        <div className="d-flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`btn btn-outline-primary ${selectedCategory === category.id ? 'active' : ''} mb-2`}
              onClick={() => handleCategoryChange({ target: { value: category.id } })}
              style={{ whiteSpace: 'nowrap' }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mt-5">
        <h4 className="mb-3">Featured Deals</h4>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
              <div key={index} className="col">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-100 h-100 object-fit-contain p-2"
                    />
                  </div>
                  <div className="card-body text-center">
                    <h6 className="card-title">{product.name}</h6>
                    <p className="card-text text-success fw-bold">${product.price?.toFixed(2) || 'N/A'}</p>
                    <button className="btn btn-outline-primary w-100" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No featured products available.</p>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mt-5 mb-5">
        <h4 className="mb-3">All Products</h4>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {products.length === 0 ? (
            <p className="text-center">No products found.</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="col">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-img-top overflow-hidden" style={{ height: '250px' }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-100 h-100 object-fit-contain p-2"
                    />
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description.substring(0, 50)}...</p>
                    <p className="card-text text-success fw-bold">${product.price.toFixed(2)}</p>
                    <button className="btn btn-outline-primary w-100" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Summary and Checkout */}
      <div className="container mt-5 mb-5">
        <h4 className="mb-3">Cart ({cart.items.length} items)</h4>
        {cart.items.length > 0 ? (
          <div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, index) => (
                    <tr key={index}>
                      <td>{getProductName(item.productId)}</td>
                      <td>{item.productId}</td>
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
            <button className="btn btn-success w-100 mt-3" onClick={placeOrderHandler}>
              Checkout
            </button>
          </div>
        ) : (
          <p className="text-center text-muted">Cart is empty.</p>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
}

export default Home;