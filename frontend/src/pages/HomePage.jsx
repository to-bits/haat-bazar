import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="hb-hero">
      <h1>Welcome to Haat-Bazar 🛒</h1>
      <p>
        A small multi-service marketplace powered by Spring Boot microservices
        behind a Spring Cloud Gateway.
      </p>

      {!user ? (
        <div className="hb-cta-row">
          <Link to="/login" className="hb-btn hb-btn-primary">
            Sign in
          </Link>
          <Link to="/register" className="hb-btn hb-btn-ghost">
            Create account
          </Link>
        </div>
      ) : (
        <div className="hb-cta-row">
          <Link to="/products" className="hb-btn hb-btn-primary">
            Browse products
          </Link>
          <Link to="/orders" className="hb-btn hb-btn-ghost">
            My orders
          </Link>
        </div>
      )}
    </section>
  );
}
