import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const userId = "guest"; // Static userId

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError('Failed to load product');
    }
  };

  const addToCart = async () => {
    if (!product) return;
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
        alert('Added to cart!');
        navigate('/cart'); // Redirect to /cart after adding to cart
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  const buyNow = async () => {
    if (!product) return;
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
        // Immediately navigate to cart-checkout after adding to cart
        navigate('/cart-checkout', { state: { cart: { items: [{ productId: product.id, quantity: 1, price: product.price }] } } });
      } else {
        throw new Error('Failed to add to cart for buy now');
      }
    } catch (err) {
      setError('Failed to process buy now');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div>Loading...</div>;

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

      {/* Product Details Content */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="img-fluid"
            />
          </div>
          <div className="col-md-6">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p className="text-success fw-bold">${product.price.toFixed(2)}</p>
            <button className="btn btn-outline-primary w-100 mb-2" onClick={addToCart}>
              Add to Cart
            </button>
            <button className="btn btn-success w-100" onClick={buyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;