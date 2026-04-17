import { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { ShoppingCart, RefreshCw } from 'lucide-react';

const UserStore = () => {
  const [storeStock, setStoreStock] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, transRes] = await Promise.all([
        axios.get('/admin/price'),
        axios.get('/store/transactions')
      ]);
      setStoreStock(prodRes.data.stock || 0);
      setTransactions(transRes.data);
    } catch (err) {
      showMessage('Failed to load store data', 'error');
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

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!buyQuantity || buyQuantity <= 0) return;

    try {
      await axios.post('/store/buy', { quantity: Number(buyQuantity) });
      setBuyQuantity('');
      showMessage('Purchase requested, awaiting admin approval.');
      fetchData(); // refresh store stock
    } catch (err) {
      showMessage(err.response?.data?.message || 'Purchase failed', 'error');
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
            <ShoppingCart size={24} color="var(--color-primary)" />
            Water Store
          </h3>

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading store data...</p>
          ) : (
            <>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Buy 1.5L water bottles to store in your virtual stock indefinitely. They will be added to your account after an Admin confirms the purchase.
              </p>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                  Currently Available in Store:
                </p>
                <div className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>
                  {storeStock} <span style={{ fontSize: '1rem', color: 'var(--color-text)' }}>Bottles</span>
                </div>
              </div>

              <form onSubmit={handleBuy} className="d-flex flex-col gap-3">
                <label className="form-label">Purchase Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="1"
                  max={storeStock > 0 ? storeStock : 1}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '1rem' }} disabled={storeStock <= 0 || loading}>
                  Request Purchase
                </button>
              </form>
            </>
          )}
        </div>

        <div className="glass-card history-sidebar" style={{ background: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255,255,255,0.05)', height: 'fit-content' }}>
          <div className="d-flex justify-between align-center" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Recent Purchases</h3>
            <button onClick={fetchData} className="btn btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--color-text-muted)' }}>
              <RefreshCw size={16} />
            </button>
          </div>

          {transactions.filter(t => t.type === 'buy').length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0', fontSize: '0.9rem' }}>No recent activity.</p>
          ) : (
            <div className="d-flex flex-col gap-2">
              {transactions.filter(t => t.type === 'buy').slice(0, 5).map((t) => (
                <div key={t._id} className="d-flex justify-between align-center" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.quantity} Bottles</div>
                  </div>
                  <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'rejected' ? 'badge-warning' : 'badge-warning'}`} style={{ backgroundColor: t.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : undefined, color: t.status === 'rejected' ? 'var(--color-danger)' : undefined, borderColor: t.status === 'rejected' ? 'rgba(239, 68, 68, 0.3)' : undefined }}>
                    {t.status}
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

export default UserStore;
