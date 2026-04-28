import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { ArrowDownToLine, RefreshCw, XCircle } from 'lucide-react';
import Loader from '../../components/Loader';

const UserWithdraw = () => {
  const [stockBalance, setStockBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawQuantity, setWithdrawQuantity] = useState('');
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
      showMessage('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCancel = async (transactionId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      setLoading(true);
      await axios.put(`/store/transactions/${transactionId}/cancel`);
      showMessage('Withdrawal request cancelled');
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to cancel', 'error');
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawQuantity || withdrawQuantity <= 0) return;

    try {
      const res = await axios.post('/store/withdraw', { quantity: Number(withdrawQuantity) });
      setStockBalance(res.data.stock_balance);
      setWithdrawQuantity('');
      showMessage('Withdrawal request submitted! Waiting for admin approval.');
      fetchData(); // refresh history and balance
    } catch (err) {
      showMessage(err.response?.data?.message || 'Withdrawal failed', 'error');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
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

      <div className="centered-layout">
        {/* Filler to perfectly center the form */}
        <div className="desktop-spacer"></div>

        <div className="glass-card" style={{ border: '1px solid var(--color-primary)', boxShadow: '0 0 25px rgba(0, 210, 255, 0.15)', zIndex: 2 }}>
          <h3 className="d-flex align-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            <ArrowDownToLine size={24} color="var(--color-primary)" />
            Request Delivery / Withdrawal
          </h3>

          {loading ? (
            <Loader />
          ) : (
            <>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Request physical delivery or withdrawal of water from your existing personal virtual stock balance.
              </p>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                  Your Virtual Stock Balance:
                </p>
                <div className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>
                  {stockBalance} <span style={{ fontSize: '1rem', color: 'var(--color-text)' }}>Bottles</span>
                </div>
              </div>

              <form onSubmit={handleWithdraw} className="d-flex flex-col gap-3">
                <label className="form-label">Withdrawal Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="1"
                  value={withdrawQuantity}
                  onChange={(e) => setWithdrawQuantity(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '1rem' }} disabled={loading}>
                  Request Withdrawal
                </button>
              </form>
            </>
          )}
        </div>

        <div className="glass-card history-sidebar" style={{ background: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255,255,255,0.05)', height: 'fit-content' }}>
          <div className="d-flex justify-between align-center" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Recent Withdrawals</h3>
            <button onClick={fetchData} className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--color-text-muted)' }}>
              <RefreshCw size={16} />
            </button>
          </div>

          {transactions.filter(t => t.type === 'withdraw').length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0', fontSize: '0.9rem' }}>No recent activity.</p>
          ) : (
            <div className="d-flex flex-col gap-2">
              {transactions.filter(t => t.type === 'withdraw').slice(0, 5).map((t) => (
                <div key={t._id} className="d-flex justify-between align-center" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.quantity} Bottles</div>
                  </div>
                  <div className="d-flex align-center">
                    <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'rejected' || t.status === 'cancelled' ? 'badge-warning' : 'badge-warning'}`} style={{ backgroundColor: t.status === 'rejected' || t.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : undefined, color: t.status === 'rejected' || t.status === 'cancelled' ? 'var(--color-danger)' : undefined, borderColor: t.status === 'rejected' || t.status === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : undefined }}>
                      {t.status}
                    </span>
                    {t.status === 'pending' && (
                      <button 
                        onClick={() => handleCancel(t._id)}
                        className="btn-cancel-icon" 
                        title="Cancel Request"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWithdraw;
