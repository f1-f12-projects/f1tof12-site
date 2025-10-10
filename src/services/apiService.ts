const BASE_URL = process.env.REACT_APP_BASE_URL;

let refreshTokenFunction: (() => Promise<boolean>) | null = null;

export const setRefreshTokenFunction = (fn: () => Promise<boolean>) => {
  refreshTokenFunction = fn;
};

const apiCall = async <T>(method: string, endpoint: string, body?: any): Promise<T> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Add CloudFront secret for all endpoints except login (production only)
  if (process.env.REACT_APP_CLOUDFRONT_SECRET) {
    headers['x-cloudfront-secret'] = process.env.REACT_APP_CLOUDFRONT_SECRET;
  }
  
  // Add custom origin header (only if required by backend)
  // headers['x-origin'] = window.location.origin;
  
  // Add Bearer token for all endpoints except login
  if (!endpoint.includes('/login')) {
    const token = localStorage.getItem('authToken');
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.exp < Math.floor(Date.now() / 1000)) {
        if (refreshTokenFunction) {
          const refreshed = await refreshTokenFunction();
          if (!refreshed) {
            window.location.href = '/login';
            throw new Error('Authentication failed');
          }
          const newToken = localStorage.getItem('authToken');
          headers['Authorization'] = `Bearer ${newToken}`;
        } else {
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const config: RequestInit = {
    method,
    headers
  };
  
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Authentication failed. Please try logging in again.');
    }
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`HTTP ${response.status}: ${errorData.detail || errorData.message || response.statusText}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  
  return response.json();
};

export const apiService = {
  get: <T>(endpoint: string): Promise<T> => apiCall<T>('GET', endpoint),
  post: <T>(endpoint: string, body: any): Promise<T> => apiCall<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body: any): Promise<T> => apiCall<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string): Promise<T> => apiCall<T>('DELETE', endpoint)
};