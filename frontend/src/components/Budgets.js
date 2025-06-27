import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Budgets.css';

const Budgets = () => {
  const { userId } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    monthlyLimit: ''
  });

  // Fetch budgets from API (requires userId as query param)
  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch(`/api/budgets?userId=${userId}`, {
        headers: {
          // Keep auth header if token logic is introduced later
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      } else {
        setError('Failed to fetch budgets');
      }
    } catch (err) {
      setError('Error fetching budgets');
    }
  }, [userId]);

  // Fetch categories for dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBudgets(), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, [fetchBudgets, fetchCategories]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.categoryId || !formData.monthlyLimit) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.monthlyLimit) <= 0) {
      setError('Monthly limit must be greater than 0');
      return;
    }

    try {
      const url = editingBudget 
        ? `/api/budgets/${editingBudget.id}`
        : '/api/budgets';
      
      const method = editingBudget ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          categoryId: parseInt(formData.categoryId),
          monthlyLimit: parseFloat(formData.monthlyLimit),
          userId
        })
      });

      if (response.ok) {
        await fetchBudgets(); // Refresh the list
        resetForm();
        setShowForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save budget');
      }
    } catch (err) {
      setError('Error saving budget');
    }
  };

  // Handle delete budget
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${id}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchBudgets(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete budget');
      }
    } catch (err) {
      setError('Error deleting budget');
    }
  };

  // Handle edit budget
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId.toString(),
      monthlyLimit: budget.monthlyLimit.toString()
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      categoryId: '',
      monthlyLimit: ''
    });
    setEditingBudget(null);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setError('');
  };

  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.currentSpend || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  // Check if spending exceeds limit
  const isOverBudget = (currentSpend, limit) => {
    return currentSpend > limit;
  };

  // Get available categories (not already budgeted)
  const getAvailableCategories = () => {
    if (editingBudget) {
      return categories; // When editing, show all categories
    }
    const budgetedCategoryIds = budgets.map(b => b.categoryId);
    return categories.filter(cat => !budgetedCategoryIds.includes(cat.id));
  };

  if (loading) {
    return (
      <div className="budgets-container">
        <div className="loading">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="budgets-container">
      <header className="page-header">
        <h1>Budgets</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowForm(true)} 
            className="add-budget-btn"
            disabled={getAvailableCategories().length === 0 && !editingBudget}
          >
            + Set Budget
          </button>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="budgets-content">
        {/* Budget Overview */}
        <div className="budget-overview">
          <div className="overview-card">
            <h3>Total Budget</h3>
            <span className="amount">${totalBudget.toFixed(2)}</span>
          </div>
          <div className="overview-card">
            <h3>Total Spent</h3>
            <span className="amount">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="overview-card">
            <h3>Remaining</h3>
            <span className={`amount ${totalRemaining >= 0 ? 'positive' : 'negative'}`}>
              ${totalRemaining.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="budget-form-container">
            <div className="form-header">
              <h3>{editingBudget ? 'Edit Budget' : 'Set New Budget'}</h3>
              <button onClick={handleCancel} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="budget-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryId">Category</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {getAvailableCategories().map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="monthlyLimit">Monthly Limit ($)</label>
                  <input
                    type="number"
                    id="monthlyLimit"
                    name="monthlyLimit"
                    value={formData.monthlyLimit}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingBudget ? 'Update Budget' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Budgets Table */}
        <div className="budgets-table-container">
          <h3>Budget Overview</h3>
          {budgets.length === 0 ? (
            <div className="no-budgets">
              <p>No budgets set yet. Click "Set Budget" to get started!</p>
            </div>
          ) : (
            <div className="budgets-table-wrapper">
              <table className="budgets-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Monthly Limit</th>
                    <th>Current Spend</th>
                    <th>Remaining</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map(budget => {
                    const currentSpend = budget.currentSpend || 0;
                    const remaining = budget.monthlyLimit - currentSpend;
                    const percentage = Math.min((currentSpend / budget.monthlyLimit) * 100, 100);
                    const isOver = isOverBudget(currentSpend, budget.monthlyLimit);
                    
                    return (
                      <tr 
                        key={budget.id} 
                        className={isOver ? 'over-budget-row' : ''}
                      >
                        <td className="category-cell">
                          <span className="category-name">{budget.categoryName}</span>
                        </td>
                        <td className="limit-cell">
                          ${budget.monthlyLimit.toFixed(2)}
                        </td>
                        <td className={`spend-cell ${isOver ? 'over-budget' : ''}`}>
                          ${currentSpend.toFixed(2)}
                        </td>
                        <td className={`remaining-cell ${remaining < 0 ? 'negative' : 'positive'}`}>
                          ${remaining.toFixed(2)}
                        </td>
                        <td className="progress-cell">
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div 
                                className={`progress-fill ${isOver ? 'over-budget' : ''}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <button 
                            onClick={() => handleEdit(budget)}
                            className="edit-btn"
                            title="Edit budget"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(budget.id)}
                            className="delete-btn"
                            title="Delete budget"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets; 