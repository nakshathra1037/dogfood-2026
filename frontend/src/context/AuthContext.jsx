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

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('dogfood_auth_token') || localStorage.getItem('dogfood_token'));
  });

  const [loading, setLoading] = useState(true);

  // Sync session with backend /auth/me on mount
  useEffect(() => {
    const syncUserSession = async () => {
      const token = localStorage.getItem('dogfood_auth_token') || localStorage.getItem('dogfood_token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            setIsAuthenticated(true);
            localStorage.setItem('dogfood_user', JSON.stringify(res.data));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    syncUserSession();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dogfood_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dogfood_user');
    }
  }, [user]);

  const login = (firstArg, secondArg) => {
    // Standard backend auth call: login(access_token, userObject)
    if (typeof firstArg === 'string' && typeof secondArg === 'object' && secondArg !== null) {
      const token = firstArg;
      const userObj = secondArg;
      setUser(userObj);
      setIsAuthenticated(true);
      localStorage.setItem('dogfood_token', token);
      localStorage.setItem('dogfood_auth_token', token);
      localStorage.setItem('dogfood_user', JSON.stringify(userObj));
      return userObj;
    }

    return null;
  };

  const register = (userData) => {
    const newUser = {
      id: userData.id,
      role: (userData.role || 'PARTICIPANT').toUpperCase(),
      name: userData.name || '',
      email: userData.email || '',
      ...userData,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    if (userData.token) {
      localStorage.setItem('dogfood_token', userData.token);
      localStorage.setItem('dogfood_auth_token', userData.token);
      localStorage.setItem('dogfood_user', JSON.stringify(newUser));
    }
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dogfood_token');
    localStorage.removeItem('dogfood_auth_token');
    localStorage.removeItem('dogfood_user');
  };

  const roleUpper = (user?.role || '').toUpperCase();
  const isOrganizer = roleUpper === 'ORGANIZER' || roleUpper === 'ADMIN';
  const isAdmin = roleUpper === 'ADMIN' || isOrganizer;
  const isJudge = roleUpper === 'JUDGE' || isAdmin;
  const isParticipant = !isOrganizer && !isJudge;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        isOrganizer,
        isAdmin,
        isJudge,
        isParticipant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
