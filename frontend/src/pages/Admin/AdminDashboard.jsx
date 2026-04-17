import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { PackageSearch, CheckCircle, XCircle, RefreshCw, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [reqRes, priceRes] = await Promise.all([
        axios.get('/admin/requests'),
        axios.get('/admin/price')
      ]);
      setRequests(reqRes.data);
      setPrice(priceRes.data.price);
      setStock(priceRes.data.stock);
      setNewPrice(priceRes.data.price);
      setNewStock(priceRes.data.stock);
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

        {/* Pending Requests */}
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
        
      </div>
    </div>
  );
};

export default AdminDashboard;
