const BASE_URL = process.env.REACT_APP_BASE_URL;

const apiCall = async <T>(method: string, endpoint: string, body?: any): Promise<T> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Add Bearer token for all endpoints except login
  if (!endpoint.includes('/login')) {
    const token = localStorage.getItem('authToken');
    if (token) {
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