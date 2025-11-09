import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setRefreshTokenFunction } from '../services/apiService';
import { UserRole } from '../types/roles';
import { cacheService } from '../services/cacheService';

interface UserData {
  profileId: string;
  givenName: string;
  familyName: string;
}

interface AuthContextType {
  username: string | null;
  authToken: string | null;
  userRole: UserRole | null;
  userData: UserData | null;
  login: (username: string, token: string, role: UserRole, userData?: UserData, expiresIn?: number, expiresAt?: string, refreshToken?: string, cacheData?: Record<string, any>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuthentication: () => Promise<boolean>;
  handleAuthError: () => void;
  refreshAccessToken: () => Promise<boolean>;
  cacheData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const refreshTokenAPI = async (refreshToken: string): Promise<{ access_token: string; expires_in?: number; expires_at?: string; refresh_token?: string } | null> => {
  try {
    console.log('Attempting to refresh token...');
    const response = await fetch(process.env.REACT_APP_REFRESH_TOKEN_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Token refresh successful');
      return result;
    } else {
      console.log('Token refresh failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  const login = (username: string, token: string, role: UserRole, userData?: UserData, expiresIn?: number, expiresAt?: string, refreshToken?: string, cacheData?: Record<string, any>) => {
    setUsername(username);
    setAuthToken(token);
    setUserRole(role);
    setUserData(userData || null);
    setExpiresIn(expiresIn || null);
    setExpiresAt(expiresAt || null);
    setRefreshToken(refreshToken || null);
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    if (userData) localStorage.setItem('userData', JSON.stringify(userData));
    if (expiresIn) localStorage.setItem('expiresIn', expiresIn.toString());
    if (expiresAt) localStorage.setItem('expiresAt', expiresAt);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    
    if (cacheData) {
      Object.entries(cacheData).forEach(([key, data]) => {
        cacheService.set(key, data);
      });
    }
    
    setupRefreshTimer(expiresAt);
  };

  const logout = () => {
    setUsername(null);
    setAuthToken(null);
    setUserRole(null);
    setUserData(null);
    setRefreshToken(null);
    setExpiresIn(null);
    setExpiresAt(null);
    if (refreshTimer) clearTimeout(refreshTimer);
    setRefreshTimer(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('expiresAt');
    cacheService.clear();
  };

  const setupRefreshTimer = (expiresAt?: string) => {
    if (refreshTimer) clearTimeout(refreshTimer);
    
    if (!expiresAt) {
      console.log('No expiresAt provided, skipping timer setup');
      return;
    }
    
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const refreshTime = Math.max(timeUntilExpiry - 60000, 5000); // Refresh 1 minute before expiry, minimum 5 seconds
    
    console.log('Setting up refresh timer:', {
      expiresAt,
      expiryTime: new Date(expiryTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      localExpiryTime: new Date(expiryTime).toLocaleString(),
      localCurrentTime: new Date(currentTime).toLocaleString(),
      timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + 's',
      refreshTime: Math.round(refreshTime / 1000) + 's',
      timezoneOffset: new Date().getTimezoneOffset() + ' minutes',
      isExpired: timeUntilExpiry <= 0
    });
    
    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        console.log('Timer triggered, calling refreshAccessToken');
        refreshAccessToken();
      }, refreshTime);
      setRefreshTimer(timer);
      console.log('Timer set successfully');
    } else {
      console.log('Refresh time is not positive, timer not set');
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing) return false;
    
    const storedRefreshToken = refreshToken || localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      console.log('No refresh token available');
      return false;
    }
    
    setIsRefreshing(true);
    
    const result = await refreshTokenAPI(storedRefreshToken);
    if (result) {
      console.log('Access token refreshed successfully');
      setAuthToken(result.access_token);
      localStorage.setItem('authToken', result.access_token);
      if (result.expires_in) {
        setExpiresIn(result.expires_in);
        localStorage.setItem('expiresIn', result.expires_in.toString());
      }
      if (result.expires_at) {
        setExpiresAt(result.expires_at);
        localStorage.setItem('expiresAt', result.expires_at);
        setupRefreshTimer(result.expires_at);
      }
      if (result.refresh_token) {
        setRefreshToken(result.refresh_token);
        localStorage.setItem('refreshToken', result.refresh_token);
      }
      setIsRefreshing(false);
      return true;
    }
    console.log('Token refresh failed, logging out');
    setIsRefreshing(false);
    logout();
    return false;
  };

  const handleAuthError = async () => {
    const refreshed = await refreshAccessToken();
    if (!refreshed) logout();
  };

  useEffect(() => {
    setRefreshTokenFunction(refreshAccessToken);
    
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole') as UserRole;
    const storedUserData = localStorage.getItem('userData');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedExpiresIn = localStorage.getItem('expiresIn');
    const storedExpiresAt = localStorage.getItem('expiresAt');
    
    if (token && storedUsername) {
      if (isTokenExpired(token)) {
        if (storedRefreshToken) {
          refreshTokenAPI(storedRefreshToken).then(result => {
            if (result) {
              setAuthToken(result.access_token);
              setUsername(storedUsername);
              setUserRole(storedUserRole);
              setUserData(storedUserData ? JSON.parse(storedUserData) : null);
              setRefreshToken(result.refresh_token || storedRefreshToken);
              setExpiresIn(result.expires_in || null);
              setExpiresAt(result.expires_at || null);
              localStorage.setItem('authToken', result.access_token);
              if (result.expires_in) localStorage.setItem('expiresIn', result.expires_in.toString());
              if (result.expires_at) localStorage.setItem('expiresAt', result.expires_at);
              if (result.refresh_token) localStorage.setItem('refreshToken', result.refresh_token);
              setupRefreshTimer(result.expires_at);
            } else {
              logout();
            }
          });
        } else {
          logout();
        }
      } else {
        setAuthToken(token);
        setUsername(storedUsername);
        setUserRole(storedUserRole);
        setUserData(storedUserData ? JSON.parse(storedUserData) : null);
        setRefreshToken(storedRefreshToken);
        setExpiresIn(storedExpiresIn ? parseInt(storedExpiresIn) : null);
        setExpiresAt(storedExpiresAt);
        setupRefreshTimer(storedExpiresAt || undefined);
      }
    }
    
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  const checkAuthentication = async (): Promise<boolean> => {
    if (!username || !authToken) return false;
    
    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      if (currentTime >= expiryTime) {
        const refreshed = await refreshAccessToken();
        return refreshed;
      }
    } else if (isTokenExpired(authToken)) {
      const refreshed = await refreshAccessToken();
      return refreshed;
    }
    
    return true;
  };

  const cacheData = (key: string, data: any) => {
    cacheService.set(key, data);
  };

  const getCachedData = (key: string) => {
    return cacheService.get(key);
  };

  const isAuthenticated = !!username && !!authToken && !isTokenExpired(authToken || '');

  return (
    <AuthContext.Provider value={{ username, authToken, userRole, userData, login, logout, isAuthenticated, checkAuthentication, handleAuthError, refreshAccessToken, cacheData, getCachedData }}>
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