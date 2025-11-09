import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'uni-role-auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Failed to parse auth storage', err);
      return null;
    }
  });
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (authData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authData]);

  const value = useMemo(
    () => ({
      user: authData?.user ?? null,
      token: authData?.token ?? null,
      setAuthData,
      clearAuth: () => setAuthData(null),
      usingMockData,
      setUsingMockData,
    }),
    [authData, usingMockData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
