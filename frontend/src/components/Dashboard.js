import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { userId, displayName, preferredCurrency, monthlyIncomeGoal, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate financial summaries
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Get current month's transactions
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
  };

  // Calculate monthly summary by category
  const getMonthlyMummary = () => {
    const currentMonthTransactions = getCurrentMonthTransactions();
    const categoryTotals = {};
    
    // Initialize all categories with 0
    categories.forEach(category => {
      categoryTotals[category.id] = {
        name: category.name,
        income: 0,
        expense: 0,
        net: 0
      };
    });
    
    // Calculate totals for each category
    currentMonthTransactions.forEach(transaction => {
      const categoryId = transaction.categoryId;
      if (categoryTotals[categoryId]) {
        if (transaction.type === 'income') {
          categoryTotals[categoryId].income += transaction.amount;
        } else {
          categoryTotals[categoryId].expense += transaction.amount;
        }
        categoryTotals[categoryId].net = categoryTotals[categoryId].income - categoryTotals[categoryId].expense;
      }
    });
    
    // Filter out categories with no transactions and sort by total activity
    return Object.values(categoryTotals)
      .filter(cat => cat.income > 0 || cat.expense > 0)
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  };

  // Get overall monthly totals
  const getMonthlyTotals = () => {
    const currentMonthTransactions = getCurrentMonthTransactions();
    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income: monthlyIncome,
      expense: monthlyExpense,
      net: monthlyIncome - monthlyExpense
    };
  };

  // Get recent transactions (last 10)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all data in parallel
        const [transactionsRes, categoriesRes] = await Promise.all([
          fetch(`/api/transactions?userId=${userId}`),
          fetch('/api/categories')
        ]);

        // Check if all requests were successful
        if (!transactionsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        // Parse all responses
        const [transactionsData, categoriesData] = await Promise.all([
          transactionsRes.json(),
          categoriesRes.json()
        ]);

        setTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleLogout = () => {
    logout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferredCurrency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Calculate income goal progress
  const getIncomeGoalProgress = () => {
    if (!monthlyIncomeGoal) return null;
    
    const monthlyTotals = getMonthlyTotals();
    const progressPercentage = (monthlyTotals.income / monthlyIncomeGoal) * 100;
    
    return {
      current: monthlyTotals.income,
      goal: monthlyIncomeGoal,
      percentage: Math.min(progressPercentage, 100),
      isComplete: monthlyTotals.income >= monthlyIncomeGoal
    };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const monthlySummary = getMonthlyMummary();
  const monthlyTotals = getMonthlyTotals();
  const maxAmount = Math.max(...monthlySummary.map(cat => Math.max(cat.income, cat.expense)), 1);
  const incomeGoalProgress = getIncomeGoalProgress();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p className="welcome-message">Welcome back, {displayName || 'User'}! 👋</p>
        </div>
        <div className="user-info">
          <Link to="/settings" className="settings-link" title="Account Settings">
            ⚙️ Settings
          </Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        
        {/* Income Goal Progress */}
        {incomeGoalProgress && (
          <div className="income-goal-section">
            <div className="income-goal-card">
              <h3>Monthly Income Goal Progress</h3>
              <div className="goal-progress">
                <div className="goal-amounts">
                  <span className="current-amount">{formatCurrency(incomeGoalProgress.current)}</span>
                  <span className="goal-separator"> / </span>
                  <span className="goal-amount">{formatCurrency(incomeGoalProgress.goal)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${incomeGoalProgress.isComplete ? 'complete' : ''}`}
                    style={{ width: `${incomeGoalProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="progress-percentage">
                  {incomeGoalProgress.percentage.toFixed(1)}% Complete
                  {incomeGoalProgress.isComplete && ' 🎉'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Financial Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card income-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="amount">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          
          <div className="summary-card expense-card">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
          
          <div className={`summary-card balance-card ${netBalance >= 0 ? 'positive' : 'negative'}`}>
            <div className="card-icon">{netBalance >= 0 ? '📈' : '📉'}</div>
            <div className="card-content">
              <h3>Net Balance</h3>
              <p className="amount">{formatCurrency(netBalance)}</p>
            </div>
          </div>
        </div>

        {/* Monthly Summary Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Monthly Summary - {getCurrentMonthName()}</h2>
          </div>
          
          {monthlySummary.length > 0 ? (
            <div className="monthly-summary-content">
              {/* Monthly Totals */}
              <div className="monthly-totals">
                <div className="monthly-total-item income">
                  <span className="label">Monthly Income:</span>
                  <span className="value">{formatCurrency(monthlyTotals.income)}</span>
                </div>
                <div className="monthly-total-item expense">
                  <span className="label">Monthly Expenses:</span>
                  <span className="value">{formatCurrency(monthlyTotals.expense)}</span>
                </div>
                <div className={`monthly-total-item net ${monthlyTotals.net >= 0 ? 'positive' : 'negative'}`}>
                  <span className="label">Monthly Net:</span>
                  <span className="value">{formatCurrency(monthlyTotals.net)}</span>
                </div>
              </div>

              {/* Category Bar Chart */}
              <div className="category-chart">
                <h4>Spending by Category</h4>
                <div className="chart-container">
                  {monthlySummary.map((category, index) => (
                    <div key={category.name} className="chart-row">
                      <div className="chart-label">
                        <span className="category-name">{category.name}</span>
                        <span className="category-amounts">
                          {category.income > 0 && (
                            <span className="income-amount">+{formatCurrency(category.income)}</span>
                          )}
                          {category.expense > 0 && (
                            <span className="expense-amount">-{formatCurrency(category.expense)}</span>
                          )}
                        </span>
                      </div>
                      <div className="chart-bars">
                        {category.income > 0 && (
                          <div className="bar-container income-bar">
                            <div 
                              className="bar income"
                              style={{ width: `${(category.income / maxAmount) * 100}%` }}
                              title={`Income: ${formatCurrency(category.income)}`}
                            ></div>
                          </div>
                        )}
                        {category.expense > 0 && (
                          <div className="bar-container expense-bar">
                            <div 
                              className="bar expense"
                              style={{ width: `${(category.expense / maxAmount) * 100}%` }}
                              title={`Expense: ${formatCurrency(category.expense)}`}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No transactions found for {getCurrentMonthName()}.</p>
              <Link to="/transactions" className="action-link">Add your first transaction</Link>
            </div>
          )}
        </div>

        {/* Recent Transactions Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <Link to="/transactions" className="view-all-link">View All</Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.description}</td>
                      <td>{getCategoryName(transaction.categoryId)}</td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`amount ${transaction.type}`}>
                        {transaction.type === 'expense' ? '-' : '+'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No transactions found.</p>
              <Link to="/transactions" className="action-link">Add your first transaction</Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/transactions" className="action-link">
              <span className="action-icon">💳</span>
              Manage Transactions
            </Link>
            <Link to="/categories" className="action-link">
              <span className="action-icon">🏷️</span>
              Manage Categories
            </Link>
            <Link to="/budgets" className="action-link">
              <span className="action-icon">📊</span>
              View Budgets
            </Link>
            <Link to="/settings" className="action-link">
              <span className="action-icon">⚙️</span>
              Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 