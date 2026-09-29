import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const token = localStorage.getItem('travelease_token') || localStorage.getItem('travelgo_token');
      const savedUser = localStorage.getItem('travelease_user') || localStorage.getItem('travelgo_user');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Pre-seed state from local storage for instant responsiveness while verifying
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore corrupted JSON
        }
      }

      try {
        const verifiedUser = await authAPI.getProfile();
        setUser(verifiedUser);
        localStorage.setItem('travelease_user', JSON.stringify(verifiedUser));
      } catch (err) {
        console.warn('Session verification failed, clearing invalid authentication credentials:', err.message);
        localStorage.removeItem('travelease_token');
        localStorage.removeItem('travelease_user');
        localStorage.removeItem('travelgo_token');
        localStorage.removeItem('travelgo_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    localStorage.setItem('travelease_token', data.token);
    localStorage.setItem('travelease_user', JSON.stringify(data.user));
    // Backwards compatibility
    localStorage.setItem('travelgo_token', data.token);
    localStorage.setItem('travelgo_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    localStorage.setItem('travelease_token', data.token);
    localStorage.setItem('travelease_user', JSON.stringify(data.user));
    localStorage.setItem('travelgo_token', data.token);
    localStorage.setItem('travelgo_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('travelease_token');
    localStorage.removeItem('travelease_user');
    localStorage.removeItem('travelgo_token');
    localStorage.removeItem('travelgo_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('travelease_user', JSON.stringify(updatedUser));
    localStorage.setItem('travelgo_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
