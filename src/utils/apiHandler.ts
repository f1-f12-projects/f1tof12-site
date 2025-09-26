import { ApiResponse, ApiError } from '../models/ApiResponse';
import { alert } from './alert';

const extractErrorMessage = (error: any): string => {
  const { detail, message } = error.data || error;
  
  if (Array.isArray(detail)) {
    return detail.map((err: any) => {
      const field = err.loc ? err.loc.slice(-1)[0] : '';
      const fieldInfo = field ? ` (${field})` : '';
      return `${err.msg}${fieldInfo}`;
    }).join(', ');
  }
  if (detail?.message) return detail.message;
  if (typeof detail === 'string') return detail;
  if (message) return message;
  return 'Operation failed';
};

export const handleApiResponse = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  onSuccess?: (data: T, message: string) => void,
  onError?: (error: ApiError) => void
): Promise<T | null> => {
  try {
    const response = await apiCall();
    
    if (response.success) {
      if (onSuccess) {
        onSuccess(response.data as T, response.message);
      }
      alert.success(response.message);
      return response.data as T;
    }
    
    const errorMsg = response.message || 'Operation failed';
    onError ? onError(response as any) : alert.error(errorMsg);
    return null;
  } catch (error: any) {
    if (error.status === 403) {
      const errorMsg = extractErrorMessage(error);
      alert.error(errorMsg);
      return null;
    }
    
    const errorMsg = extractErrorMessage(error);
    onError ? onError(error.data || error) : alert.error(errorMsg);
    return null;
  }
};