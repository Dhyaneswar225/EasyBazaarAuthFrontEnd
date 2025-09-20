import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, searchProducts, getCategories } from '../services/api';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchTerm, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    fetchProducts(searchTerm, e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // clear token
    navigate('/login'); // redirect to login page
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f3f3' }}>
      {/* Header with Logout on top-right */}
      <div className="d-flex align-items-center p-3 shadow-sm" style={{ backgroundColor: 'white' }}>
        <h2 className="m-0">DazzleDepot</h2>
        <button
          className="btn btn-outline-secondary ms-auto"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="container mt-5">
        <h1>Welcome to DazzleDepot</h1>
        <p>Your one-stop shop for everything!</p>

        {/* Search Bar and Category Filter */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-control"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Search</button>
            </div>
          </div>
        </form>

        {/* Product Grid */}
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
                    <button className="btn btn-outline-primary">Add to Cart</button>
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
