import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isDemo, setIsDemo] = useState(localStorage.getItem('isDemo') === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedIsDemo = localStorage.getItem('isDemo') === 'true';
      const storedToken = localStorage.getItem('token');
      
      if (storedIsDemo) {
        setIsDemo(true);
        setUser({ username: 'Demo User', email: 'demo@instance.local', role: 'user' });
        setToken('demo-mode-active');
        setLoading(false);
        return;
      }

      if (storedToken && storedToken !== 'demo-mode-active') {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error("Auth session recovery failed:", err);
          // On network failure, we still keep the token to allow potential retry/offline
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken, userData) => {
    setIsDemo(false);
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('isDemo', 'false');
  };
  
  const enterDemoMode = () => {
    try {
      console.log("AuthContext: Initializing localized demo instance...");
      localStorage.setItem('isDemo', 'true');
      localStorage.setItem('token', 'demo-mode-active');
      setIsDemo(true);
      setToken('demo-mode-active');
      setUser({ username: 'Demo User', email: 'demo@instance.local', role: 'user' });
    } catch (err) {
      console.error("AuthContext: Failed to enter demo mode:", err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsDemo(false);
    localStorage.removeItem('isDemo');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isDemo, loading, login, logout, setUser, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
