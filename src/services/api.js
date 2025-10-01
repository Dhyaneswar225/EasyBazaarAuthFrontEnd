import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // API Gateway
  withCredentials:true,
});

export const register = (user) =>
  api.post('/api/auth/register', {
    email: user.email,
    passwordHash: user.password, // Rename to password in a real app (consider hashing client-side or server-side)
    name: user.name,
    countryCode: user.countryCode,
    mobileNumber: user.mobileNumber,
  });

export const login = (user) =>
  api.post('/api/auth/login', {
    email: user.email,
    passwordHash: user.password, // Rename to password in a real app
  });

export const getProducts = () => api.get('/api/products');
export const searchProducts = (name) => api.get(`/api/products/search?name=${name}`);
export const getCategories = () => api.get('/api/categories');
export const getFeaturedProducts = () => api.get('/api/homepage/featured');
export const addToCart = (userId, item) =>api.post(`/api/cart/add?userId=${userId}`, item);
export const getCart = (userId) =>api.get(`/api/cart/${userId}`);
export const removeFromCart = (userId, item) =>api.post(`/api/cart/remove?userId=${userId}`, item);
export const placeOrder = (order) => api.post('/api/orders/place', order);
export const getOrders = (userId) => api.get(`/api/orders/${userId}`);
export const getOrderDetails = (orderId) => api.get(`/api/orders/track/${orderId}`);
export const getProfile = (email) => api.get(`/api/profile?email=${email}`);
