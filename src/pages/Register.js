import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Import react-select for dropdown
import { register } from '../services/api';
import ReactCountryFlag from 'react-country-flag';
function Register() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    countryCode: '+91', // Default to India
    mobileNumber: '' 
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const navigate = useNavigate();

   // Country options with flags and digit validation
  const countryOptions = [
    { value: '+1', label: (<><ReactCountryFlag countryCode="US" svg style={{ marginRight: '8px' }} />United States</>), digits: 10 },
    { value: '+44', label: (<><ReactCountryFlag countryCode="GB" svg style={{ marginRight: '8px' }} />United Kingdom</>), digits: 10 },
    { value: '+91', label: (<><ReactCountryFlag countryCode="IN" svg style={{ marginRight: '8px' }} />India</>), digits: 10 },
    { value: '+49', label: (<><ReactCountryFlag countryCode="DE" svg style={{ marginRight: '8px' }} />Germany</>), digits: 11 },
    { value: '+33', label: (<><ReactCountryFlag countryCode="FR" svg style={{ marginRight: '8px' }} />France</>), digits: 9 },
    { value: '+81', label: (<><ReactCountryFlag countryCode="JP" svg style={{ marginRight: '8px' }} />Japan</>), digits: 11 },
    { value: '+86', label: (<><ReactCountryFlag countryCode="CN" svg style={{ marginRight: '8px' }} />China</>), digits: 11 },
    { value: '+82', label: (<><ReactCountryFlag countryCode="KR" svg style={{ marginRight: '8px' }} />South Korea</>), digits: 10 },
    { value: '+61', label: (<><ReactCountryFlag countryCode="AU" svg style={{ marginRight: '8px' }} />Australia</>), digits: 9 },
    { value: '+55', label: (<><ReactCountryFlag countryCode="BR" svg style={{ marginRight: '8px' }} />Brazil</>), digits: 11 },
    { value: '+92', label: (<><ReactCountryFlag countryCode="PK" svg style={{ marginRight: '8px' }} />Pakistan</>), digits: 10 },
    { value: '+880', label: (<><ReactCountryFlag countryCode="BD" svg style={{ marginRight: '8px' }} />Bangladesh</>), digits: 10 },
    { value: '+94', label: (<><ReactCountryFlag countryCode="LK" svg style={{ marginRight: '8px' }} />Sri Lanka</>), digits: 9 },
    { value: '+7', label: (<><ReactCountryFlag countryCode="RU" svg style={{ marginRight: '8px' }} />Russia</>), digits: 10 },
    { value: '+39', label: (<><ReactCountryFlag countryCode="IT" svg style={{ marginRight: '8px' }} />Italy</>), digits: 10 },
    { value: '+34', label: (<><ReactCountryFlag countryCode="ES" svg style={{ marginRight: '8px' }} />Spain</>), digits: 9 },
    { value: '+62', label: (<><ReactCountryFlag countryCode="ID" svg style={{ marginRight: '8px' }} />Indonesia</>), digits: 11 },
    { value: '+63', label: (<><ReactCountryFlag countryCode="PH" svg style={{ marginRight: '8px' }} />Philippines</>), digits: 10 },
    { value: '+971', label: (<><ReactCountryFlag countryCode="AE" svg style={{ marginRight: '8px' }} />UAE</>), digits: 9 },
    { value: '+966', label: (<><ReactCountryFlag countryCode="SA" svg style={{ marginRight: '8px' }} />Saudi Arabia</>), digits: 9 },
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate password strength on change
    if (name === 'password') {
      validatePassword(value);
    }

    // Validate mobile number on change
    if (name === 'mobileNumber') {
      validateMobileNumber(value, formData.countryCode);
    }
  };

  const handleCountryChange = (selectedOption) => {
    setFormData({ ...formData, countryCode: selectedOption.value });
    validateMobileNumber(formData.mobileNumber, selectedOption.value);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!password) {
      setPasswordError('');
      return;
    }
    if (password.length < minLength) {
      setPasswordError(`Password must be at least ${minLength} characters long`);
      return;
    }
    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      setPasswordError('Password must include uppercase, lowercase, number, and special character');
      return;
    }
    setPasswordError('');
  };

  const validateMobileNumber = (mobileNumber, countryCode) => {
    const country = countryOptions.find(c => c.value === countryCode);
    if (!country) return;

    const digits = mobileNumber.replace(/\D/g, ''); // Remove non-digits
    if (!mobileNumber) {
      setMobileError('');
      return;
    }
    if (digits.length !== country.digits) {
      setMobileError(`Mobile number must be ${country.digits} digits for ${country.label}`);
      return;
    }
    if (!/^\d+$/.test(digits)) {
      setMobileError('Mobile number must contain only digits');
      return;
    }
    setMobileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError || mobileError) {
      setError('Please fix the issues before submitting');
      return;
    }
    try {
      await register(formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#f3f3f3' }}>
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '450px', borderRadius: '10px' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontWeight: '700', color: '#ff9900' }}>EasyBazaar</h2>
          <p className="text-muted">Create a new account</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {passwordError && <div className="alert alert-warning">{passwordError}</div>}
        {mobileError && <div className="alert alert-warning">{mobileError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              name="name"
              className="form-control form-control-lg"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mobile Number</label>
            <div className="d-flex">
              <Select
                name="countryCode"
                value={countryOptions.find(c => c.value === formData.countryCode)}
                onChange={handleCountryChange}
                options={countryOptions}
                className="me-2"
                styles={{
                  control: (provided) => ({ ...provided, minHeight: '52px' }),
                  singleValue: (provided) => ({ ...provided, fontSize: '16px' }),
                }}
                placeholder="Select Country"
                isSearchable={false}
              />
              <input
                type="tel"
                name="mobileNumber"
                className="form-control form-control-lg"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              />
            </div>
          </div>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control form-control-lg"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              className="form-control form-control-lg"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-warning w-100 fw-bold" disabled={!!passwordError || !!mobileError}>
            Register
          </button>
          <div className="text-center mt-3">
            <small>
              Already have an account? <a href="/login">Login here</a>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;