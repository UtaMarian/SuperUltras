// src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axiosInstance.get('/auth', {
          headers: { 'x-auth-token': token }
        });
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      loadUser();
      navigate('/'); // Redirect to homepage after login
    } catch (err) {
      console.error(err);
      throw new Error('Login failed');
    }
  };

  const register = async (username, email, password,favoriteTeam,position ) => {
    try {
      await axiosInstance.post('/auth/register', { username, email, password,favoriteTeam,position  });
    } catch (err) {
      console.error(err);
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); // Clear token
    setIsAuthenticated(false); // Update authentication state
    navigate('/login');
    setUser(null); // Clear user state
 
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading,loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
