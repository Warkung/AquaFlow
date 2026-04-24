import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { UserPlus, RefreshCw } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/register', { username, password });
      const { token, role, username: loggedInUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', loggedInUser);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <div className="d-flex flex-col align-center text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <UserPlus size={36} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Join AquaFlow to manage your stock</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '4px', color: 'var(--color-text)' }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              className="form-input" 
              type="text" 
              id="username" 
              placeholder="johndoe" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              className="form-input" 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary d-flex justify-center align-center gap-2" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <><RefreshCw size={18} className="animate-spin" /> Creating account...</> : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
