import { useAuth } from '../context/AuthContext';
import { cacheService } from '../services/cacheService';

export const useCache = () => {
  const { cacheData, getCachedData } = useAuth();

  const configureCacheKeys = (config: Record<string, { ttl?: number; persistent?: boolean }>) => {
    cacheService.configure(config);
  };

  return {
    cacheData,
    getCachedData,
    configureCacheKeys
  };
};