import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../api/products';
import { inventoryApi } from '../api/inventory';
import { orderApi } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await productApi.get(id);
        setProduct(p);
        try {
          const inv = await inventoryApi.check(id);
          setStock(inv.quantity);
        } catch {
          setStock(p.stock);
        }
      } catch {
        setErr('Product not found.');
      }
    })();
  }, [id]);

  const addToCart = async () => {
    if (!user) return navigate('/login');
    setBusy(true);
    setErr('');
    setOkMsg('');
    try {
      await orderApi.addToCart(user.id, {
        productId: Number(id),
        quantity: Number(qty),
        price: Number(product.price),
      });
      setOkMsg('Added to cart.');
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not add to cart.');
    } finally {
      setBusy(false);
    }
  };

  if (err) return <div className="hb-error">{err}</div>;
  if (!product) return <p>Loading…</p>;

  return (
    <section className="hb-section">
      <Link to="/products" className="hb-back">
        ← Back to products
      </Link>
      <div className="hb-detail">
        <div>
          <h2>{product.name}</h2>
          <p className="hb-card-cat">{product.category || 'Uncategorized'}</p>
          <p>{product.description}</p>
        </div>
        <aside className="hb-detail-aside">
          <p className="hb-card-price">৳{Number(product.price).toFixed(2)}</p>
          <p>In stock: {stock ?? product.stock}</p>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max={stock ?? product.stock}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>
          <button
            className="hb-btn hb-btn-primary"
            onClick={addToCart}
            disabled={busy || (stock !== null && stock <= 0)}
          >
            {busy ? 'Adding…' : 'Add to cart'}
          </button>
          {okMsg && <div className="hb-ok">{okMsg}</div>}
        </aside>
      </div>
    </section>
  );
}
