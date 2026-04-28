import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { Package, ShoppingCart, ArrowDownToLine, RefreshCw, XCircle } from 'lucide-react';
import Loader from '../../components/Loader';

const UserDashboard = () => {
  const [stockBalance, setStockBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, transRes] = await Promise.all([
        axios.get('/auth/me'),
        axios.get('/store/transactions')
      ]);
      setStockBalance(userRes.data.stock_balance || 0);
      setTransactions(transRes.data);
    } catch (err) {
      showMessage('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleCancel = async (transactionId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      setLoading(true);
      await axios.put(`/store/transactions/${transactionId}/cancel`);
      showMessage('Transaction cancelled successfully');
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to cancel transaction', 'error');
      setLoading(false);
    }
  };


  if (loading && transactions.length === 0) {
    return <Loader fullScreen={true} />;
  }

  return (
    <div className="animate-fade-in">
      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          borderLeft: `4px solid ${message.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)'}`
        }}>
          {message.text}
        </div>
      )}

      <div className="d-flex flex-col gap-4">
        {/* Stock Overview Card */}
        <div className="glass-card d-flex align-center justify-between">
          <div>
            <h2 style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>Current Stock Balance</h2>
            <div className="d-flex align-center gap-2">
              <span style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }} className="text-gradient">{stockBalance}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>1.5L Bottles</span>
            </div>
          </div>
          <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
            <Package size={48} color="var(--color-primary)" />
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-card">
          <div className="d-flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>All Transaction History</h3>
            <button onClick={fetchData} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }}>
              <RefreshCw size={18} />
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No transactions found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex align-center gap-1" style={{ color: t.type === 'buy' ? 'var(--color-primary)' : '#c084fc', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                          {t.type === 'buy' ? <ShoppingCart size={14} /> : <ArrowDownToLine size={14} />}
                          <span>{t.type}</span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{t.quantity}</span> Bottles</td>
                      <td>
                        <div className="d-flex align-center">
                          <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'rejected' || t.status === 'cancelled' ? 'badge-warning' : 'badge-warning'}`} style={{ backgroundColor: t.status === 'rejected' || t.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : undefined, color: t.status === 'rejected' || t.status === 'cancelled' ? 'var(--color-danger)' : undefined, borderColor: t.status === 'rejected' || t.status === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : undefined }}>
                            {t.status}
                          </span>
                          {t.status === 'pending' && (
                            <button 
                              onClick={() => handleCancel(t._id)}
                              className="btn btn-outline" 
                              style={{ padding: '0.2rem 0.4rem', border: 'none', color: 'var(--color-danger)', marginLeft: '0.5rem' }}
                              title="Cancel Request"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
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

export default UserDashboard;
