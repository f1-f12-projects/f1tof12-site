const BASE_URL = process.env.REACT_APP_BASE_URL;

let refreshTokenFunction: (() => Promise<boolean>) | null = null;

export const setRefreshTokenFunction = (fn: () => Promise<boolean>) => {
  refreshTokenFunction = fn;
};

const apiCall = async <T>(method: string, endpoint: string, body?: any, isFormData = false): Promise<T> => {
  const headers: Record<string, string> = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
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
    config.body = isFormData ? body : JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Authentication failed. Please try logging in again.');
    }
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.detail?.message || errorData.detail || errorData.message || errorData.error;
    if (!errorMessage) {
      errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
    }
    if (!errorMessage || errorMessage === '{}') {
      errorMessage = response.statusText;
    }
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  
  const data = await response.json();
  
  // Add response headers to data if it's an ApiResponse object
  if (data && typeof data === 'object' && 'success' in data) {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    data.headers = headers;
  }
  
  return data;
};

export const apiService = {
  get: <T>(endpoint: string): Promise<T> => apiCall<T>('GET', endpoint),
  post: <T>(endpoint: string, body: any): Promise<T> => apiCall<T>('POST', endpoint, body),
  postFormData: <T>(endpoint: string, formData: FormData): Promise<T> => apiCall<T>('POST', endpoint, formData, true),
  put: <T>(endpoint: string, body: any): Promise<T> => apiCall<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string): Promise<T> => apiCall<T>('DELETE', endpoint)
};