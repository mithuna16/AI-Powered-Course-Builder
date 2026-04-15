import React, { createContext, useContext, useState, useEffect } from 'react';
import API from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

 useEffect(() => {
   const syncXP = () => {
     const xp = parseInt(localStorage.getItem('userXp') || '0');
     setUser(prev => prev ? { ...prev, xp } : prev);
   };

   window.addEventListener('storage', syncXP);
   return () => window.removeEventListener('storage', syncXP);
 }, []);

  const login = async (email, password) => {
    try {

      const response = await API.post('/login', { email, password });

      // Backend returns JSON: { status, userId, email, xp, learningHours }
      if (response.data.status === 'SUCCESS') {
        const mockToken = btoa(email + ':' + Date.now());
        const userData = {
          email,
          userId: response.data.userId,
          xp: response.data.xp || 0,
          learningHours: response.data.learningHours || 0,
        };

        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userXp', (response.data.xp || 0).toString());
        setToken(mockToken);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (email, password) => {
    try {
      await API.post('/register', { email, password });
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userXp');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F1A]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};