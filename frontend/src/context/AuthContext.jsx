import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dogfood_user');
    return saved ? JSON.parse(saved) : mockUsers.currentUser;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('dogfood_auth_token') || true;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dogfood_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dogfood_user');
    }
  }, [user]);

  const login = (firstArg, secondArg, role = 'participant') => {
    // Real backend auth call: login(access_token, userObject)
    if (typeof firstArg === 'string' && typeof secondArg === 'object' && secondArg !== null) {
      const token = firstArg;
      const userObj = secondArg;
      setUser(userObj);
      setIsAuthenticated(true);
      localStorage.setItem('dogfood_token', token);
      localStorage.setItem('dogfood_auth_token', token);
      return userObj;
    }

    // Legacy mock login call: login(email, password, role)
    const email = firstArg;
    const targetUser = role === 'organizer' ? mockUsers.organizerUser : mockUsers.currentUser;
    const authenticatedUser = { ...targetUser, email, role };
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('dogfood_token', 'mock_jwt_token_123456789');
    localStorage.setItem('dogfood_auth_token', 'mock_jwt_token_123456789');
    return authenticatedUser;
  };

  const register = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: userData.role || 'participant',
      registeredHackathons: [],
      activeTeams: [],
      ...userData,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('dogfood_token', 'mock_jwt_token_123456789');
    localStorage.setItem('dogfood_auth_token', 'mock_jwt_token_123456789');
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dogfood_token');
    localStorage.removeItem('dogfood_auth_token');
    localStorage.removeItem('dogfood_user');
  };

  const switchRole = (newRole) => {
    const targetUser = newRole === 'organizer' ? mockUsers.organizerUser : mockUsers.currentUser;
    const updated = { ...targetUser, role: newRole };
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
