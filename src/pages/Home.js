import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, searchProducts, getCategories, getFeaturedProducts } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchFeaturedProducts();
  }, []);

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
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f3f3' }}>
      {/* Header */}
      <div className="d-flex align-items-center p-3 shadow-sm" style={{ backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000 }}>
        <h2 className="m-0">EasyBazaar</h2>
        <div className="ms-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px', display: 'inline-block' }}
          />
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="container mt-3">
        <div style={{ height: '300px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <img
            src= "https://rukminim2.flixcart.com/fk-p-flap/960/160/image/3abc11594efaf6dd.jpg?q=60"
            alt="EasyBazaar Sales"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="container mt-4">
        <h4>Shop by Category</h4>
        <div className="d-flex overflow-auto pb-2" style={{ gap: '15px' }}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`btn btn-outline-primary ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange({ target: { value: category.id } })}
              style={{ whiteSpace: 'nowrap' }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mt-4">
        <h4>Featured Deals</h4>
        <div className="d-flex overflow-auto pb-2" style={{ gap: '15px' }}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
              <div key={index} className="card" style={{ minWidth: '200px', flex: '0 0 auto' }}>
                <div style={{ height: '150px', overflow: 'hidden' }}>
                  <img
                    src={product.imageUrl}
                    className="card-img-top"
                    alt={product.name}
                    style={{ maxHeight: '150px', objectFit: 'contain', width: '100%' }}
                  />
                </div>
                <div className="card-body">
                  <h6 className="card-title">{product.name}</h6>
                  <p className="card-text"><strong>${product.price?.toFixed(2) || 'N/A'}</strong></p>
                  <button className="btn btn-outline-primary w-100">Add to Cart</button>
                </div>
              </div>
            ))
          ) : (
            <p>No featured products available.</p>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mt-4">
        <h4>All Products</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img
                      src={product.imageUrl}
                      className="card-img-top"
                      alt={product.name}
                      style={{ maxHeight: '200px', objectFit: 'contain', width: '100%' }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <p className="card-text"><strong>${product.price.toFixed(2)}</strong></p>
                    <button className="btn btn-outline-primary w-100">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
