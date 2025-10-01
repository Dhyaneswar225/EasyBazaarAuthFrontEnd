import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Example: Assuming an AuthContext for user authentication
const AuthContext = React.createContext();

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ email: '', name: '' });
  const [editMode, setEditMode] = useState(false);
  const auth = useContext(AuthContext); // Get auth context
  const userEmail = auth?.user?.email || localStorage.getItem('userEmail') || 'guest';
  const userNameKey = `userName_${userEmail}`; // Unique key per email

  useEffect(() => {
    // Use localStorage data with email-specific key
    setUserData({
      email: userEmail,
      name: localStorage.getItem(userNameKey) || 'Not specified',
    });
  }, [userEmail, userNameKey]);

  const handleUpdateProfile = () => {
    if (editMode) {
      localStorage.setItem(userNameKey, userData.name); // Save name with email-specific key
      setEditMode(false);
      alert('Name updated locally!');
    } else {
      setEditMode(true);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, name: e.target.value });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <div className="container d-flex align-items-center justify-content-between">
          <button
            className="btn p-0 m-0 text-primary me-2"
            onClick={handleBackToHome}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            EasyBazaar
          </button>
          <button className="btn btn-secondary" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mt-5 mb-5">
        <h2 className="mb-4">My Profile</h2>
        <div className="card p-4 shadow-sm">
          <h4 className="card-title">User Information</h4>
          <div className="mb-3">
            <strong>Email:</strong> {userData.email}
          </div>
          <div className="mb-3">
            <strong>Name:</strong>
            {editMode ? (
              <input
                type="text"
                className="form-control"
                value={userData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            ) : (
              userData.name
            )}
          </div>
          <button className="btn btn-primary" onClick={handleUpdateProfile}>
            {editMode ? 'Save' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;