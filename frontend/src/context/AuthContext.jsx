import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isDemo, setIsDemo] = useState(localStorage.getItem('isDemo') === 'true');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      // If no token, we might still be in demo mode
      if (!isDemo) setUser(null);
    }
  }, [token, isDemo]);

  useEffect(() => {
    localStorage.setItem('isDemo', isDemo);
    if (isDemo) {
      setUser({ username: 'Demo User', email: 'demo@instance.local', role: 'user' });
      setToken('demo-mode-active'); // Dummy token to bypass UserRoute guards
    }
  }, [isDemo]);

  const login = (newToken, userData) => {
    setIsDemo(false);
    setToken(newToken);
    setUser(userData);
  };
  
  const enterDemoMode = () => {
    setIsDemo(true);
    setToken('demo-mode-active');
    setUser({ username: 'Demo User', email: 'demo@instance.local', role: 'user' });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsDemo(false);
    localStorage.removeItem('isDemo');
  };

  return (
    <AuthContext.Provider value={{ user, token, isDemo, login, logout, setUser, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
