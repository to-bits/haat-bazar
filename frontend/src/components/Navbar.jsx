import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isSellerOrAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="hb-nav">
      <Link to="/" className="hb-brand">
        🛒 Haat-Bazar
      </Link>

      <div className="hb-nav-links">
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>
        {isSellerOrAdmin && <Link to="/inventory">Inventory</Link>}
        {isSellerOrAdmin && <Link to="/categories">Categories</Link>}
      </div>

      <div className="hb-nav-user">
        {user ? (
          <>
            <span className="hb-user-badge">
              {user.email} <small>({user.role})</small>
            </span>
            <button className="hb-btn hb-btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hb-btn hb-btn-ghost">
              Login
            </Link>
            <Link to="/register" className="hb-btn hb-btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
