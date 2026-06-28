import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await register(form);
      navigate('/products', { replace: true });
    } catch (e2) {
      setErr(
        e2.response?.data?.message ||
          e2.response?.data?.error ||
          'Registration failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hb-auth-card">
      <h2>Create your account</h2>
      <form onSubmit={submit}>
        <label>
          Full name
          <input value={form.name} onChange={update('name')} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={update('password')}
            required
          />
        </label>
        <label>
          I am a…
          <select value={form.role} onChange={update('role')}>
            <option value="CUSTOMER">Customer</option>
            <option value="SELLER">Seller</option>
          </select>
        </label>
        {err && <div className="hb-error">{err}</div>}
        <button type="submit" className="hb-btn hb-btn-primary" disabled={busy}>
          {busy ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
