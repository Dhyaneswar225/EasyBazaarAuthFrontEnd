import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, searchProducts, getCategories, getFeaturedProducts, getCart, getOrders } from '../services/api';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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
  const [currentLocation, setCurrentLocation] = useState('Mumbai 400001'); // Default
  const [loadingLocation, setLoadingLocation] = useState(false);
  const userId = "guest"; // Static userId
  const [userEmail, setUserEmail] = useState(''); // Store logged-in email

  useEffect(() => {
    fetchInitialData();
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) setUserEmail(savedEmail);
  }, [location]);

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
      console.log('Cart updated:', updatedCart.items);
    } catch (err) {
      setError('Failed to load cart');
      setCart({ items: [] });
    }
  };

  const fetchLatestOrder = async () => {
    try {
      const response = await getOrders(userId);
      if (response.data && response.data.length > 0) {
        const latestOrder = response.data.reduce((latest, current) =>
          new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current
        );
        setLatestOrderId(latestOrder.id);
      } else {
        setLatestOrderId(null); // Explicitly set to null if no orders
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLatestOrderId(null); // Handle error by setting to null
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
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUserEmail('');
    navigate('/login');
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
// In handleLogin function of Home.js
const handleLogin = async (user) => {
  const response = await login(user);
  localStorage.setItem('userEmail', response.data.email);
  // Optionally clear old name data if needed, or rely on the new key
  setUserEmail(response.data.email);
  navigate('/home');
};
  const getProductName = (productId) => {
    const product = [...products, ...featuredProducts].find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

  const fetchCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data && data.address) {
              const address = data.address;
              const locationStr = `${address.city || address.town || address.village || 'Unknown'} ${address.postcode || ''}`.trim();
              setCurrentLocation(locationStr);
              localStorage.setItem('currentLocation', locationStr);
            } else {
              setError('Could not determine location');
            }
          } catch (err) {
            console.error('Error fetching address:', err);
            setError('Failed to fetch location');
          }
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Location access denied');
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setError('Geolocation not supported');
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <button
              className="btn p-0 m-0 text-primary me-2"
              onClick={() => navigate('/home')}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              EasyBazaar
            </button>
            <span
              className="badge bg-light text-dark d-flex align-items-center"
              style={{ cursor: loadingLocation ? 'not-allowed' : 'pointer' }}
              onClick={loadingLocation ? null : fetchCurrentLocation}
            >
              <i className="bi bi-geo-alt me-1"></i>
              {loadingLocation ? 'Updating...' : currentLocation}
            </span>
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
            <button
              className="btn btn-info"
              onClick={() => navigate('/cart')}
              style={{ whiteSpace: 'nowrap' }}
            >
              View Cart ({cart.items.length > 0 ? cart.items.length : 0})
            </button>
            {/* My Profile Dropdown */}
            <div className="dropdown me-2">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ whiteSpace: 'nowrap' }}
              >
                My Profile {userEmail ? `(${userEmail})` : ''}
              </button>
              <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                <li><a className="dropdown-item" href="/profile" onClick={() => navigate('/profile')}>Profile</a></li>
                <li><a className="dropdown-item" href="/my-orders" onClick={() => navigate('/my-orders')}>My Orders</a></li>
                <li><a className="dropdown-item" href="/cart" onClick={() => navigate('/cart')}>View cart</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item text-danger" href="#logout" onClick={handleLogout}>Logout</a></li>
              </ul>
            </div>
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
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="card-body text-center">
                    <h6 className="card-title">{product.name}</h6>
                    <p className="card-text text-success fw-bold">${product.price?.toFixed(2) || 'N/A'}</p>
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
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description.substring(0, 50)}...</p>
                    <p className="card-text text-success fw-bold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}

export default Home;