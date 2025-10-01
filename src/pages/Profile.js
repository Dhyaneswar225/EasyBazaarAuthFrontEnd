import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ email: '', name: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ fullName: '', addressLine1: '', city: '', postalCode: '', phoneNumber: '' });
  const [editAddress, setEditAddress] = useState(null);
  const [editedValues, setEditedValues] = useState({ fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem('userEmail') || 'guest';

  useEffect(() => {
    setUserData({
      email: userEmail,
      name: localStorage.getItem(`userName_${userEmail}`) || 'Not specified',
    });
    fetchAddresses();
  }, [userEmail]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/addresses/${userEmail}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAddresses(data || []);
    } catch (err) {
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddress, userEmail, isDefault: true }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setNewAddress({ fullName: '', addressLine1: '', city: '', postalCode: '', phoneNumber: '' });
      fetchAddresses();
    } catch (err) {
      setError('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/addresses/${addressId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchAddresses();
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const handleEditAddress = (address) => {
    setEditAddress(address.id);
    setEditedValues({ ...address });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/addresses/${editAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editedValues, userEmail, id: editAddress }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setEditAddress(null);
      setEditedValues({ fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', phoneNumber: '' });
      fetchAddresses();
    } catch (err) {
      setError('Failed to update address');
    }
  };

  const handleCancelEdit = () => {
    setEditAddress(null);
    setEditedValues({ fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', phoneNumber: '' });
  };

  const handleSetDefault = async (addressId) => {
    try {
      const addressToUpdate = addresses.find(addr => addr.id === addressId);
      if (addressToUpdate) {
        const response = await fetch(`http://localhost:8080/api/addresses/${addressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...addressToUpdate, isDefault: true, userEmail }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        for (const addr of addresses) {
          if (addr.id !== addressId && addr.isDefault) {
            await fetch(`http://localhost:8080/api/addresses/${addr.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...addr, isDefault: false, userEmail }),
            });
          }
        }
        fetchAddresses();
      }
    } catch (err) {
      setError('Failed to set default address');
    }
  };

  const handleBackToHome = () => navigate('/home');

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
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
        <div className="row g-4">
          {/* User Info */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">👤 User Information</h5>
              <p><strong>Email:</strong><br /> {userData.email}</p>
              <p><strong>Name:</strong><br /> {userData.name}</p>
            </div>
          </div>

          {/* Addresses */}
          <div className="col-md-8">
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">📍 Delivery Addresses</h5>

              {error && <div className="alert alert-danger">{error}</div>}

              {/* Add New Address */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">➕ Add New Address</h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Phone Number"
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Address Line 1"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Address Line 2"
                      value={newAddress.addressLine2 || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="State"
                      value={newAddress.state || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Postal Code"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100 mt-2" onClick={handleAddAddress}>
                      Save Address
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved Addresses */}
              <h6 className="fw-semibold mb-3">📦 Saved Addresses</h6>
              {addresses.length > 0 ? (
                <div className="list-group">
                  {addresses.map((address) => (
                    <div key={address.id} className="list-group-item rounded-3 mb-2 shadow-sm">
                      <div className="d-flex justify-content-between">
                        <div>
                          {editAddress === address.id ? (
                            <div className="row g-2">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.fullName}
                                  onChange={(e) => setEditedValues({ ...editedValues, fullName: e.target.value })}
                                />
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.phoneNumber}
                                  onChange={(e) => setEditedValues({ ...editedValues, phoneNumber: e.target.value })}
                                />
                              </div>
                              <div className="col-12">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.addressLine1}
                                  onChange={(e) => setEditedValues({ ...editedValues, addressLine1: e.target.value })}
                                />
                              </div>
                              <div className="col-12">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.addressLine2 || ''}
                                  onChange={(e) => setEditedValues({ ...editedValues, addressLine2: e.target.value })}
                                />
                              </div>
                              <div className="col-md-4">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.city}
                                  onChange={(e) => setEditedValues({ ...editedValues, city: e.target.value })}
                                />
                              </div>
                              <div className="col-md-4">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.state || ''}
                                  onChange={(e) => setEditedValues({ ...editedValues, state: e.target.value })}
                                />
                              </div>
                              <div className="col-md-4">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={editedValues.postalCode}
                                  onChange={(e) => setEditedValues({ ...editedValues, postalCode: e.target.value })}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <strong>{address.fullName}</strong><br />
                              {address.addressLine1}, {address.addressLine2}<br />
                              {address.city}, {address.state} {address.postalCode}<br />
                              📞 {address.phoneNumber}
                              {address.isDefault && <span className="badge bg-success ms-2">Default</span>}
                            </>
                          )}
                        </div>
                        <div className="text-end">
                          {editAddress === address.id ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={handleSaveEdit}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditAddress(address)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                Delete
                              </button>
                              {!address.isDefault && (
                                <button
                                  className="btn btn-sm btn-outline-secondary ms-2"
                                  onClick={() => handleSetDefault(address.id)}
                                >
                                  Set Default
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No addresses saved yet. Add one above.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;