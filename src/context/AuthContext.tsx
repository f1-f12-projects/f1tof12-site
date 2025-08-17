import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  username: string | null;
  authToken: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const login = (username: string, token: string) => {
    setUsername(username);
    setAuthToken(token);
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setUsername(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!username && !!authToken;

  return (
    <AuthContext.Provider value={{ username, authToken, login, logout, isAuthenticated }}>
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