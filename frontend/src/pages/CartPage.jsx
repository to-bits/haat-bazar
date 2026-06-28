import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { productApi } from '../api/products';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErr('');
    try {
      const c = await orderApi.getCart(user.id);
      setCart(c);
      // Hydrate product names/prices for display.
      const ids = (c.items || []).map((it) => it.productId);
      const missing = ids.filter((pid) => !productMap[pid]);
      if (missing.length) {
        const pairs = await Promise.all(
          missing.map((pid) =>
            productApi.get(pid).then((p) => [pid, p]).catch(() => [pid, null])
          )
        );
        const next = { ...productMap };
        for (const [pid, p] of pairs) next[pid] = p;
        setProductMap(next);
      }
    } catch (e) {
      setErr('Could not load cart.');
    } finally {
      setLoading(false);
    }
  }, [user, productMap]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setQty = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await orderApi.updateCartItem(user.id, productId, quantity);
      reload();
    } catch (e) {
      setErr('Failed to update quantity.');
    }
  };

  const remove = async (productId) => {
    try {
      await orderApi.removeCartItem(user.id, productId);
      reload();
    } catch (e) {
      setErr('Failed to remove item.');
    }
  };

  if (!user) {
    return (
      <div className="hb-section">
        <p>
          Please <Link to="/login">sign in</Link> to view your cart.
        </p>
      </div>
    );
  }

  if (loading) return <p>Loading cart…</p>;
  if (err) return <div className="hb-error">{err}</div>;

  const items = cart?.items || [];
  const total = items.reduce(
    (acc, it) => acc + Number(it.price) * Number(it.quantity),
    0
  );

  return (
    <section className="hb-section">
      <h2>Your cart</h2>
      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/products">Browse products</Link>.
        </p>
      ) : (
        <>
          <table className="hb-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const p = productMap[it.productId];
                return (
                  <tr key={it.productId}>
                    <td>{p ? p.name : `Product #${it.productId}`}</td>
                    <td>৳{Number(it.price).toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) =>
                          setQty(it.productId, Number(e.target.value))
                        }
                        className="hb-qty"
                      />
                    </td>
                    <td>
                      ৳{(Number(it.price) * Number(it.quantity)).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="hb-btn hb-btn-ghost"
                        onClick={() => remove(it.productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right' }}>
                  <strong>Total</strong>
                </td>
                <td colSpan={2}>
                  <strong>৳{total.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
          <button
            className="hb-btn hb-btn-primary"
            onClick={() => navigate('/checkout')}
            style={{ marginTop: 16 }}
          >
            Proceed to checkout →
          </button>
        </>
      )}
    </section>
  );
}
