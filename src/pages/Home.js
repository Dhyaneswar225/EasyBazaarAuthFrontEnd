import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // clear token
    navigate('/login'); // redirect to login page
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f3f3' }}>
      {/* Header with Logout on top-right */}
      <div className="d-flex align-items-center p-3 shadow-sm" style={{ backgroundColor: 'white' }}>
        <h2 className="m-0">EasyBazaar</h2>
        <button
          className="btn btn-outline-secondary ms-auto"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="container mt-5 text-center">
        <h1>Welcome to EasyBazaar</h1>
        <p>Your one-stop shop for everything!</p>
      </div>
    </div>
  );
}

export default Home;
