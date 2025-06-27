import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Handle invalid JSON in localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('userId'); // Clean up old userId storage
      }
    } else {
      // Check for old userId storage and clean it up
      const oldUserId = localStorage.getItem('userId');
      if (oldUserId) {
        localStorage.removeItem('userId');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    // Clean up old userId storage if it exists
    localStorage.removeItem('userId');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('userId'); // Clean up old storage
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const value = {
    user,
    userId: user?.userId || null, // Backward compatibility
    username: user?.username || '',
    displayName: user?.displayName || user?.username || '',
    preferredCurrency: user?.preferredCurrency || 'USD',
    monthlyIncomeGoal: user?.monthlyIncomeGoal || null,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 