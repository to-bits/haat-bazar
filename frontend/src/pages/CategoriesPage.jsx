import { useEffect, useState } from 'react';
import { categoryApi } from '../api/categories';

export default function CategoriesPage() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const reload = async () => {
    try {
      setCats(await categoryApi.list());
    } catch {
      setErr('Failed to load categories.');
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await categoryApi.create({ name: name.trim() });
      setName('');
      reload();
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Failed to create category.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await categoryApi.remove(id);
      reload();
    } catch {
      setErr('Failed to delete category.');
    }
  };

  return (
    <section className="hb-section">
      <h2>Categories</h2>
      {err && <div className="hb-error">{err}</div>}
      <form className="hb-form hb-form-inline" onSubmit={create}>
        <input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="hb-btn hb-btn-primary" disabled={busy}>
          Add
        </button>
      </form>
      <ul className="hb-list">
        {cats.map((c) => (
          <li key={c.id}>
            <span>{c.name}</span>
            <button
              className="hb-btn hb-btn-ghost"
              onClick={() => remove(c.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
