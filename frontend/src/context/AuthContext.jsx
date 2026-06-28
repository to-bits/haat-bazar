import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem('hb_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(localStorage.getItem('hb_token') || null);

  useEffect(() => {
    if (token) localStorage.setItem('hb_token', token);
    else localStorage.removeItem('hb_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('hb_user', JSON.stringify(user));
    else localStorage.removeItem('hb_user');
  }, [user]);

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem('hb_token'));
      setUser(readUser());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (token && (!user || !user.id)) {
      authApi
        .me()
        .then((u) =>
          setUser((prev) => ({
            email: u.email,
            name: u.name,
            role: u.role,
            id: u.id,
            ...(prev || {}),
          }))
        )
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    try {
      const u = await authApi.me();
      const merged = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      };
      setUser(merged);
      return merged;
    } catch {
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const u = { email: payload.sub || email, role: payload.role || 'CUSTOMER' };
      setUser(u);
      return u;
    }
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    setToken(data.token);
    try {
      const u = await authApi.me();
      const merged = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      };
      setUser(merged);
      return merged;
    } catch {
      const jwt = JSON.parse(atob(data.token.split('.')[1]));
      const u = {
        email: jwt.sub || payload.email,
        role: jwt.role || payload.role,
      };
      setUser(u);
      return u;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isSellerOrAdmin =
    !!user && ['SELLER', 'ADMIN'].includes(String(user.role).toUpperCase());

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isSellerOrAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
