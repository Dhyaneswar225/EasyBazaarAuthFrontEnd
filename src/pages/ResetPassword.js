import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (response.ok) {
        setSuccess('Password reset successful! Please log in.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Invalid or expired token');
      }
    } catch (err) {
      setError('Failed to reset password');
      console.error(err);
    }
  };

  if (!token) return <div className="container mt-5"><div className="alert alert-danger">No reset token provided</div></div>;

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#f3f3f3' }}>
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontWeight: '700', color: '#ff9900' }}>EasyBazaar</h2>
          <p className="text-muted">Set your new password</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-warning w-100 fw-bold">
            Reset Password
          </button>
          <div className="text-center mt-3">
            <small>
              <a href="/login">Back to Login</a>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;