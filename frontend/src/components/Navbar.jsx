import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, LogOut, LayoutDashboard, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const storedUsername = localStorage.getItem('username');

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? 'var(--color-primary)' : 'var(--color-text)',
    fontWeight: location.pathname === path ? '600' : '500',
    borderBottom: location.pathname === path ? '2px solid var(--color-primary)' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'all 0.2s ease',
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="navbar container">
      <div className="d-flex justify-between align-center" style={{ width: '100%' }}>
        <Link to="/" className="d-flex align-center gap-1" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
          <Droplet size={28} color="var(--color-primary)" />
          <span className="text-gradient">AquaFlow</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`d-flex align-center gap-3 nav-menu ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
          {token ? (
            <>
              {role === 'customer' && (
                <>
                  <Link to="/dashboard" className="d-flex align-center gap-1" style={getLinkStyle('/dashboard')}>
                    <LayoutDashboard size={18} />
                    <span>Overview</span>
                  </Link>
                  <Link to="/withdraw" className="d-flex align-center gap-1" style={getLinkStyle('/withdraw')}>
                    <span>Withdraw</span>
                  </Link>
                  <Link to="/store" className="d-flex align-center gap-1" style={getLinkStyle('/store')}>
                    <span>Purchase</span>
                  </Link>
                </>
              )}
              {role === 'admin' && (
                <Link to="/admin" className="d-flex align-center gap-1" style={getLinkStyle('/admin')}>
                  <LayoutDashboard size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
              {storedUsername && (
                <div className="d-flex align-center gap-2" style={{ 
                  background: 'rgba(0, 210, 255, 0.08)', 
                  padding: '0.3rem 0.8rem 0.3rem 0.3rem', 
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 210, 255, 0.2)',
                  marginRight: '0.5rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, #007BFF 100%)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 2px 5px rgba(0, 210, 255, 0.3)'
                  }}>
                    <User size={14} strokeWidth={2.5} />
                  </div>
                  <span style={{ 
                    color: 'var(--color-text)', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    letterSpacing: '0.5px'
                  }}>
                    {storedUsername}
                  </span>
                </div>
              )}
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--color-text)', fontWeight: '500' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
