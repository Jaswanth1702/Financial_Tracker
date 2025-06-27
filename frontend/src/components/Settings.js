import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const { user, userId, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    preferredCurrency: 'USD',
    monthlyIncomeGoal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currencyOptions = [
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won (₩)', symbol: '₩' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || user.username || '',
        preferredCurrency: user.preferredCurrency || 'USD',
        monthlyIncomeGoal: user.monthlyIncomeGoal || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          preferredCurrency: formData.preferredCurrency,
          monthlyIncomeGoal: formData.monthlyIncomeGoal ? parseFloat(formData.monthlyIncomeGoal) : null
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setSuccess('Settings updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update settings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="settings-container">
      <header className="page-header">
        <h1>Account Settings</h1>
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      </header>

      <div className="settings-content">
        <div className="settings-form-container">
          <form onSubmit={handleSubmit} className="settings-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label htmlFor="username">Username (Read Only)</label>
                <input
                  type="text"
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="How would you like to be addressed?"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Financial Preferences</h3>
              <div className="form-group">
                <label htmlFor="preferredCurrency">Preferred Currency</label>
                <select
                  id="preferredCurrency"
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
                  onChange={handleInputChange}
                  required
                >
                  {currencyOptions.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  This will be used to display all amounts throughout the application.
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="monthlyIncomeGoal">Monthly Income Goal</label>
                <input
                  type="number"
                  id="monthlyIncomeGoal"
                  name="monthlyIncomeGoal"
                  value={formData.monthlyIncomeGoal}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Enter your target monthly income"
                />
                <small className="form-help">
                  Set a monthly income target to track your progress.
                  {formData.monthlyIncomeGoal && (
                    <span> Target: {formatCurrency(formData.monthlyIncomeGoal, formData.preferredCurrency)}</span>
                  )}
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="save-btn">
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <Link to="/dashboard" className="cancel-link">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 