import { useEffect, useState } from 'react';
import { productApi } from '../api/products';
import { inventoryApi } from '../api/inventory';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const ps = await productApi.list();
      setProducts(ps);
      const entries = await Promise.all(
        ps.map((p) =>
          inventoryApi
            .check(p.id)
            .then((inv) => [p.id, inv.quantity])
            .catch(() => [p.id, null])
        )
      );
      const m = {};
      for (const [pid, q] of entries) m[pid] = q;
      setStockMap(m);
    } catch {
      setErr('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const setStock = async (productId, value) => {
    setSaving(productId);
    try {
      await inventoryApi.set(productId, Number(value));
      setStockMap((m) => ({ ...m, [productId]: Number(value) }));
    } catch {
      setErr('Failed to update stock.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (err) return <div className="hb-error">{err}</div>;

  return (
    <section className="hb-section">
      <h2>Inventory dashboard</h2>
      <table className="hb-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Current stock</th>
            <th>Set new stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category || '—'}</td>
              <td>৳{Number(p.price).toFixed(2)}</td>
              <td>{stockMap[p.id] ?? '—'}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  defaultValue={stockMap[p.id] ?? 0}
                  className="hb-qty"
                  onBlur={(e) => {
                    if (Number(e.target.value) !== stockMap[p.id]) {
                      setStock(p.id, e.target.value);
                    }
                  }}
                />
                {saving === p.id && <small> saving…</small>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
