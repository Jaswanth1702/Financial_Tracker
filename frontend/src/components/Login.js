import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login for username:', username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.text(); // Get as text first
      console.log('Login response data:', data);
      
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        parsedData = { message: data };
      }

      if (response.ok) {
        console.log('Login successful, user data:', parsedData);
        // Store full user data in localStorage and App state
        login(parsedData);
        navigate('/dashboard');
      } else {
        console.error('Login failed:', parsedData);
        setError(parsedData.message || parsedData || 'Login failed');
      }
    } catch (err) {
      console.error('Network error during login:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
          <p>For existing users (Jashu/Jash), try password: <strong>password123</strong></p>
        </div>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login; 