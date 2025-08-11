const BASE_URL = process.env.REACT_APP_BASE_URL;

const apiCall = async <T>(method: string, endpoint: string, body?: any): Promise<T> => {
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  return response.json();
};

export const apiService = {
  get: <T>(endpoint: string): Promise<T> => apiCall<T>('GET', endpoint),
  post: <T>(endpoint: string, body: any): Promise<T> => apiCall<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body: any): Promise<T> => apiCall<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string): Promise<T> => apiCall<T>('DELETE', endpoint)
};