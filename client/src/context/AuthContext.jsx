import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('campusflow_student');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('campusflow_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setStudent(res.data.student);
            localStorage.setItem('campusflow_user', JSON.stringify(res.data.user));
            if (res.data.student) {
              localStorage.setItem('campusflow_student', JSON.stringify(res.data.student));
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user: userData, student: studentData } = res.data;
      localStorage.setItem('campusflow_token', token);
      localStorage.setItem('campusflow_user', JSON.stringify(userData));
      if (studentData) {
        localStorage.setItem('campusflow_student', JSON.stringify(studentData));
      } else {
        localStorage.removeItem('campusflow_student');
      }
      setUser(userData);
      setStudent(studentData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const quickDemoLogin = async (account) => {
    return login(account.email, account.password);
  };

  const logout = () => {
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_user');
    localStorage.removeItem('campusflow_student');
    setUser(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        loading,
        login,
        quickDemoLogin,
        logout,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student'
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
