import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { paymentApi } from '../api/payments';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const o = await orderApi.getOrder(id);
        setOrder(o);
        try {
          const p = await paymentApi.getByOrder(id);
          setPayment(p);
        } catch {
          // No payment record yet.
        }
      } catch {
        setErr('Order not found.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (err) return <div className="hb-error">{err}</div>;
  if (!order) return null;

  return (
    <section className="hb-section">
      <Link to="/orders" className="hb-back">
        ← All orders
      </Link>
      <h2>Order #{order.id}</h2>
      <p>
        Status:{' '}
        <span className={`hb-pill hb-pill-${(order.status || '').toLowerCase()}`}>
          {order.status}
        </span>
      </p>
      <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <h3>Items</h3>
      <table className="hb-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((it) => (
            <tr key={it.id}>
              <td>#{it.productId}</td>
              <td>{it.quantity}</td>
              <td>৳{Number(it.price).toFixed(2)}</td>
              <td>৳{(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right' }}>
              <strong>Total</strong>
            </td>
            <td>
              <strong>৳{Number(order.totalAmount).toFixed(2)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>

      {payment && (
        <>
          <h3>Payment</h3>
          <p>
            Method: <strong>{payment.method}</strong> · Status:{' '}
            <span className={`hb-pill hb-pill-${(payment.status || '').toLowerCase()}`}>
              {payment.status}
            </span>
          </p>
          {payment.message && <p>{payment.message}</p>}
        </>
      )}
    </section>
  );
}
