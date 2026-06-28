import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user) return;
    orderApi
      .listUserOrders(user.id)
      .then(setOrders)
      .catch(() => setErr('Could not load orders.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <p>
        Please <Link to="/login">sign in</Link> to see your orders.
      </p>
    );
  }
  if (loading) return <p>Loading…</p>;
  if (err) return <div className="hb-error">{err}</div>;

  return (
    <section className="hb-section">
      <h2>Your orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="hb-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>৳{Number(o.totalAmount).toFixed(2)}</td>
                <td>
                  <span className={`hb-pill hb-pill-${(o.status || '').toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <Link to={`/orders/${o.id}`} className="hb-btn hb-btn-ghost">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
