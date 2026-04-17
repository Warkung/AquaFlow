import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserDashboard from './pages/Dashboard/UserDashboard';
import UserStore from './pages/Dashboard/UserStore';
import UserWithdraw from './pages/Dashboard/UserWithdraw';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css'; // cleared but imported

function App() {
  const PrivateRoute = ({ children, strictRole }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return <Navigate to="/login" />;
    
    if (strictRole) {
      if (strictRole === 'customer' && role !== 'customer') return <Navigate to="/admin" />;
      if (strictRole === 'admin' && role !== 'admin') return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="container" style={{ padding: '2rem 1rem' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute strictRole="customer">
                <UserDashboard />
              </PrivateRoute>
            } />
            <Route path="/store" element={
              <PrivateRoute strictRole="customer">
                <UserStore />
              </PrivateRoute>
            } />
            <Route path="/withdraw" element={
              <PrivateRoute strictRole="customer">
                <UserWithdraw />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute strictRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
