import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useAuth } from '../context/AuthContext';

export default function ProductsPage() {
  const { isSellerOrAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const reload = async () => {
    setLoading(true);
    setErr('');
    try {
      const [p, c] = await Promise.all([
        productApi.list(),
        categoryApi.list().catch(() => []),
      ]);
      setProducts(p);
      setCategories(c);
    } catch (e) {
      setErr('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveErr('');
    try {
      await productApi.create({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      });
      setForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
      });
      setShowForm(false);
      reload();
    } catch (e2) {
      setSaveErr(
        e2.response?.data?.message || e2.response?.data?.error || 'Save failed.'
      );
    } finally {
      setSaving(false);
    }
  };

  const visible = filter
    ? products.filter((p) =>
        String(p.category || '')
          .toLowerCase()
          .includes(filter.toLowerCase())
      )
    : products;

  return (
    <section className="hb-section">
      <header className="hb-section-head">
        <h2>Browse products</h2>
        <div className="hb-section-tools">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {isSellerOrAdmin && (
            <button
              className="hb-btn hb-btn-primary"
              onClick={() => setShowForm((s) => !s)}
            >
              {showForm ? 'Close' : '+ Add product'}
            </button>
          )}
        </div>
      </header>

      {showForm && (
        <form className="hb-form" onSubmit={submit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Description
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Price (৳)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </label>
          <label>
            Category
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              <option value="">— pick —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {saveErr && <div className="hb-error">{saveErr}</div>}
          <button className="hb-btn hb-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create product'}
          </button>
        </form>
      )}

      {err && <div className="hb-error">{err}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : visible.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className="hb-grid">
          {visible.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="hb-card">
              <h3>{p.name}</h3>
              <p className="hb-card-cat">{p.category || 'Uncategorized'}</p>
              <p className="hb-card-price">৳{Number(p.price).toFixed(2)}</p>
              <p className="hb-card-stock">In stock: {p.stock}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
