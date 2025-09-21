import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // API Gateway
  withCredentials:true,
});

export const register = (user) =>
  api.post('/api/auth/register', {
    email: user.email,
    passwordHash: user.password, // Rename to password in a real app
    name: user.name,
    address: user.address,
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