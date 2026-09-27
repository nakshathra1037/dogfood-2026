import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dogfood_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dogfood_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('dogfood_user', JSON.stringify(res.data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem('dogfood_token', newToken);
    localStorage.setItem('dogfood_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('dogfood_token');
    localStorage.removeItem('dogfood_user');
    setToken(null);
    setUser(null);
  };

  const isRole = (role) => user?.role === role;
  const isOrganizer = isRole('ORGANIZER') || isRole('ADMIN');
  const isJudge = isRole('JUDGE') || isRole('ADMIN');
  const isAdmin = isRole('ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isRole,
        isOrganizer,
        isJudge,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
