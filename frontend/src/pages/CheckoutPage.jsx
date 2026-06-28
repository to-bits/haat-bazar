import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { paymentApi } from '../api/payments';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [method, setMethod] = useState('CARD');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user) return;
    orderApi
      .getCart(user.id)
      .then(setCart)
      .catch(() => setErr('Could not load cart.'));
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const items = cart?.items || [];
  const total = items.reduce(
    (acc, it) => acc + Number(it.price) * Number(it.quantity),
    0
  );

  const placeOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErr('Your cart is empty.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const order = await orderApi.checkout(user.id, method);
      // Fire-and-await payment against payment-service.
      try {
        await paymentApi.pay({
          orderId: order.id,
          userId: user.id,
          amount: total,
          method,
        });
      } catch {
        // Order is already created; payment failure shouldn't hide the order.
      }
      navigate(`/orders/${order.id}`);
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Checkout failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="hb-section">
      <h2>Checkout</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <form className="hb-form" onSubmit={placeOrder}>
          <h3>Order summary</h3>
          <ul>
            {items.map((it) => (
              <li key={it.productId}>
                Product #{it.productId} × {it.quantity} — ৳
                {(Number(it.price) * Number(it.quantity)).toFixed(2)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total: ৳{total.toFixed(2)}</strong>
          </p>

          <h3>Payment method</h3>
          <div className="hb-pay-methods">
            {['CARD', 'BKASH', 'NAGAD'].map((m) => (
              <label key={m} className="hb-pay-radio">
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={method === m}
                  onChange={() => setMethod(m)}
                />
                {m === 'CARD' && '💳 Credit / Debit Card'}
                {m === 'BKASH' && '📱 bKash'}
                {m === 'NAGAD' && '📱 Nagad'}
              </label>
            ))}
          </div>

          {err && <div className="hb-error">{err}</div>}
          <button
            type="submit"
            className="hb-btn hb-btn-primary"
            disabled={busy}
          >
            {busy ? 'Placing order…' : `Pay ৳${total.toFixed(2)} & place order`}
          </button>
        </form>
      )}
    </section>
  );
}
