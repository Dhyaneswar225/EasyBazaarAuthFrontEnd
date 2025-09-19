import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // Direct to Auth Service for now (later use Gateway)
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