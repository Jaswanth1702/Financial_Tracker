import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Categories.css';

const Categories = () => {
  const { userId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense'
  });

  // Category types
  const categoryTypes = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' }
  ];

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    loadData();
  }, []);

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

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          userId
        })
      });

      if (response.ok) {
        await fetchCategories(); // Refresh the list
        resetForm();
        setShowForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save category');
      }
    } catch (err) {
      setError('Error saving category');
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchCategories(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category');
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type || 'expense'
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense'
    });
    setEditingCategory(null);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setError('');
  };

  // Get category type badge color
  const getTypeColor = (type) => {
    return type === 'income' ? '#28a745' : '#dc3545';
  };

  if (loading) {
    return (
      <div className="categories-container">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <header className="page-header">
        <h1>Categories</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowForm(true)} 
            className="add-category-btn"
          >
            + Add Category
          </button>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="categories-content">
        {/* Category Form */}
        {showForm && (
          <div className="category-form-container">
            <div className="form-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={handleCancel} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Category Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter category name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Category Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {categoryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Categories Table */}
        <div className="categories-list">
          <h3>All Categories</h3>
          {categories.length === 0 ? (
            <div className="no-categories">
              <p>No categories found. Add your first category above!</p>
            </div>
          ) : (
            <div className="category-table">
              <div className="table-header">
                <span>Name</span>
                <span>Type</span>
                <span>Total Transactions</span>
                <span>Total Amount</span>
                <span>Actions</span>
              </div>
              {categories.map(category => (
                <div key={category.id} className="category-row">
                  <span className="category-name">{category.name}</span>
                  <span className="category-type">
                    <span 
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(category.type || 'expense') }}
                    >
                      {(category.type || 'expense').charAt(0).toUpperCase() + (category.type || 'expense').slice(1)}
                    </span>
                  </span>
                  <span className="transaction-count">
                    {category.transactionCount || 0}
                  </span>
                  <span className={`total-amount ${(category.totalAmount || 0) >= 0 ? 'positive' : 'negative'}`}>
                    ${Math.abs(category.totalAmount || 0).toFixed(2)}
                  </span>
                  <span className="actions">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="edit-btn"
                      title="Edit category"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="delete-btn"
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories; 