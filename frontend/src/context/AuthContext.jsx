import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const disableAuth = import.meta.env.VITE_DISABLE_AUTH === 'true';

  const login = async (username, password) => {
    const { data } = await api.post('/login', { username, password });
    const nextToken = disableAuth ? '' : data.token;
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(nextToken);
    setUser(data.user);
    return data;
  };

  const signup = async (username, password, name, phone) => {
    const { data } = await api.post('/signup', { username, password, name, phone });
    const nextToken = disableAuth ? '' : data.token;
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(nextToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, signup, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
