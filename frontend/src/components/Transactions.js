import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Transactions.css';

const Transactions = () => {
  const { userId, preferredCurrency } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    note: ''
  });

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      setError('Error fetching transactions');
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
      await Promise.all([fetchTransactions(), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, [fetchTransactions, fetchCategories]);

  // Format currency using user's preferred currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferredCurrency || 'USD'
    }).format(amount);
  };

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

    try {
      // Find the selected category to get its ID and type
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (!selectedCategory) {
        setError('Please select a valid category');
        return;
      }

      let transactionAmount = parseFloat(formData.amount);
      
      // Ensure amount is positive for backend validation
      // For expense categories, we'll store as positive but the frontend will handle display
      transactionAmount = Math.abs(transactionAmount);
      
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: transactionAmount,
          date: formData.date,
          categoryId: selectedCategory.id,
          note: formData.note,
          userId
        })
      });

      if (response.ok) {
        await fetchTransactions(); // Refresh the list
        resetForm();
        setShowForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save transaction');
      }
    } catch (err) {
      setError('Error saving transaction');
    }
  };

  // Handle delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchTransactions(); // Refresh the list
      } else {
        setError('Failed to delete transaction');
      }
    } catch (err) {
      setError('Error deleting transaction');
    }
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: Math.abs(transaction.amount).toString(),
      date: transaction.date,
      category: transaction.category,
      note: transaction.note || ''
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      note: ''
    });
    setEditingTransaction(null);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setError('');
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="transactions-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <header className="page-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowForm(true)} 
            className="add-transaction-btn"
          >
            + Add Transaction
          </button>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transactions-content">
        {/* Summary Cards */}
        <div className="transactions-summary">
          <div className="summary-card">
            <h3>Total Income</h3>
            <span className="amount positive">+{formatCurrency(totalIncome)}</span>
          </div>
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <span className="amount negative">-{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="summary-card">
            <h3>Net Balance</h3>
            <span className={`amount ${(totalIncome - totalExpenses) >= 0 ? 'positive' : 'negative'}`}>
              {(totalIncome - totalExpenses) >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalIncome - totalExpenses))}
            </span>
          </div>
        </div>

        {/* Transaction Form */}
        {showForm && (
          <div className="transaction-form-container">
            <div className="form-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button onClick={handleCancel} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    placeholder="Enter amount (positive number)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .sort((a, b) => {
                        // Sort by type first (income first), then by name
                        if (a.type !== b.type) {
                          return a.type === 'INCOME' ? -1 : 1;
                        }
                        return a.name.localeCompare(b.name);
                      })
                      .map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name} ({category.type === 'INCOME' ? 'Income' : 'Expense'})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="note">Note</label>
                  <input
                    type="text"
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Optional note"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Transactions Table */}
        <div className="transactions-list">
          <h3>All Transactions</h3>
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found. Add your first transaction above!</p>
            </div>
          ) : (
            <div className="transaction-table">
              <div className="table-header">
                <span>Date</span>
                <span>Note</span>
                <span>Category</span>
                <span>Amount</span>
                <span>Actions</span>
              </div>
              {transactions.map(transaction => (
                <div key={transaction.id} className="transaction-row">
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                  <span>{transaction.note || '-'}</span>
                  <span>{transaction.category}</span>
                  <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </span>
                  <span className="actions">
                    <button 
                      onClick={() => handleEdit(transaction)}
                      className="edit-btn"
                      title="Edit transaction"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction.id)}
                      className="delete-btn"
                      title="Delete transaction"
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

export default Transactions; 