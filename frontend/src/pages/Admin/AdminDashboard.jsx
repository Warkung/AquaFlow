import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { PackageSearch, CheckCircle, XCircle, RefreshCw, DollarSign, Users, ChevronDown, ChevronUp } from 'lucide-react';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [reqRes, priceRes, usersRes] = await Promise.all([
        axios.get('/admin/requests'),
        axios.get('/admin/price'),
        axios.get('/admin/users')
      ]);
      setRequests(reqRes.data);
      setPrice(priceRes.data.price);
      setStock(priceRes.data.stock);
      setNewPrice(priceRes.data.price);
      setNewStock(priceRes.data.stock);
      setUsers(usersRes.data);
    } catch (err) {
      showMessage('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/price', { 
        price: Number(newPrice),
        stock: Number(newStock)
      });
      setPrice(newPrice);
      setStock(newStock);
      showMessage('Product updated successfully');
    } catch (err) {
      showMessage('Failed to update price');
    }
  };

  const processRequest = async (id, status) => {
    try {
      await axios.put(`/admin/requests/${id}`, { status });
      showMessage(`Request ${status} successfully`);
      fetchAdminData(); // Refresh list
    } catch (err) {
      showMessage('Failed to process request');
    }
  };

  const handleExpandUser = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingTxns(true);
    try {
      const res = await axios.get(`/admin/users/${userId}/transactions`);
      setUserTransactions(res.data);
    } catch (err) {
      showMessage('Failed to load transactions');
    } finally {
      setLoadingTxns(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="d-flex justify-center align-center" style={{ minHeight: '50vh' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(0, 210, 255, 0.1)',
          borderLeft: '4px solid var(--color-primary)'
        }}>
          {message}
        </div>
      )}

      <div className="d-flex flex-col gap-4">
        
        {/* Settings Card */}
        <div className="glass-card d-flex justify-between align-center">
          <div>
            <h3 className="d-flex align-center gap-2" style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
              <DollarSign size={20} color="var(--color-primary)" />
              Product Management
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
              Current 1.5L Water Price: <strong style={{ color: 'var(--color-text)' }}>฿{price}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Total Store Stock: <strong style={{ color: 'var(--color-text)' }}>{stock} Bottles</strong>
            </p>
          </div>
          <form onSubmit={handleUpdateProduct} className="d-flex gap-2">
            <input 
              type="number" 
              className="form-input" 
              style={{ width: '100px' }}
              placeholder="Price" 
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
            <input 
              type="number" 
              className="form-input" 
              style={{ width: '100px' }}
              placeholder="Stock" 
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Update</button>
          </form>
        </div>

        {/* Tab Selector */}
        <div className="d-flex gap-2" style={{ marginBottom: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('requests')}
          >
            <PackageSearch size={18} /> Pending Requests ({requests.length})
          </button>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Registered Users
          </button>
        </div>

        {/* Pending Requests Tab */}
        {activeTab === 'requests' && (
          <div className="glass-card">
            <div className="d-flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
              <h3 className="d-flex align-center gap-2" style={{ fontSize: '1.2rem' }}>
                <PackageSearch size={20} color="var(--color-primary)" />
                Pending Requests
              </h3>
              <button onClick={fetchAdminData} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }}>
                <RefreshCw size={18} />
              </button>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center" style={{ padding: '3rem 0', color: 'var(--color-text-muted)' }}>
                <PackageSearch size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No pending requests.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Qty Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong>{r.user.username}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Stock Balance: {r.user.stock_balance}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.type === 'buy' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {r.type}
                          </span>
                        </td>
                        <td><span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{r.quantity}</span> Bottles</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              onClick={() => processRequest(r._id, 'completed')}
                              className="btn"
                              style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.4rem 0.8rem' }}
                            >
                              <CheckCircle size={16} /> Fulfill
                            </button>
                            <button 
                              onClick={() => processRequest(r._id, 'rejected')}
                              className="btn"
                              style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '0.4rem 0.8rem' }}
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card">
            <div className="d-flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
              <h3 className="d-flex align-center gap-2" style={{ fontSize: '1.2rem' }}>
                <Users size={20} color="var(--color-primary)" />
                Registered Users
              </h3>
              <button onClick={fetchAdminData} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }}>
                <RefreshCw size={18} />
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Current Stock</th>
                    <th>Joined Date</th>
                    <th style={{ textAlign: 'right' }}>History</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <React.Fragment key={u._id}>
                      <tr 
                        style={{ cursor: 'pointer', backgroundColor: expandedUser === u._id ? 'rgba(0, 210, 255, 0.05)' : 'transparent' }}
                        onClick={() => handleExpandUser(u._id)}
                      >
                        <td><strong>{u.username}</strong></td>
                        <td><span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{u.stock_balance}</span> Bottles</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }}>
                            {expandedUser === u._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>
                      {expandedUser === u._id && (
                        <tr>
                          <td colSpan="4" style={{ padding: 0 }}>
                            <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                              <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Transaction History for {u.username}</h4>
                              {loadingTxns ? (
                                <p className="text-center"><RefreshCw className="animate-spin" size={20} style={{ margin: '1rem' }} /></p>
                              ) : userTransactions.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)' }}>No transactions found for this user.</p>
                              ) : (
                                <table className="inner-table" style={{ background: 'rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden', color: 'var(--color-text)' }}>
                                  <thead style={{ background: 'rgba(0, 210, 255, 0.1)' }}>
                                    <tr>
                                      <th>Date</th>
                                      <th>Type</th>
                                      <th>Quantity</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userTransactions.map(t => (
                                      <tr key={t._id}>
                                        <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td>
                                          <span className={`badge ${t.type === 'buy' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                            {t.type}
                                          </span>
                                        </td>
                                        <td><strong>{t.quantity}</strong></td>
                                        <td>
                                          <span style={{ 
                                            color: t.status === 'completed' ? 'var(--color-success)' : 
                                                   t.status === 'rejected' ? 'var(--color-danger)' : 'var(--color-primary)',
                                            fontWeight: '600',
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase'
                                          }}>
                                            {t.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AdminDashboard;
