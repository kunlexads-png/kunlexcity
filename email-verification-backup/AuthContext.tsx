import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  viewAsGuest: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  favorites: string[];
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(['prop-001', 'prop-004']);

  useEffect(() => {
    async function initUser() {
      const stored = getStoredToken();
      if (stored) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            removeStoredToken();
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          removeStoredToken();
          setToken(null);
          setUser(null);
        }
      } else {
        // By default, start as Guest or Client
        // Let's set default as Guest so the user can see guest flow immediately, or switch to Admin/Client anytime!
        setUser(null);
      }
      setIsLoading(false);
    }

    initUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    if (res.success) {
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.auth.register(payload);
    if (res.success) {
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const viewAsGuest = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.auth.switchDemoRole(role);
      if (res.success) {
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      setFavorites(favorites.filter((id) => id !== propertyId));
    } else {
      setFavorites([...favorites, propertyId]);
    }
    if (token) {
      try {
        await api.properties.toggleFavorite(propertyId);
      } catch (err) {
        console.warn('Favorite sync error:', err);
      }
    }
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isGuest: !user,
        isAdmin: user?.role === 'ADMIN',
        isClient: user?.role === 'CLIENT',
        isLoading,
        login,
        register,
        logout,
        viewAsGuest,
        switchRole,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
