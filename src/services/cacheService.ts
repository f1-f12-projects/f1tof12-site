interface CacheConfig {
  [key: string]: {
    ttl?: number; // Time to live in milliseconds
    persistent?: boolean; // Whether to persist in localStorage
  };
}

class CacheService {
  private cache = new Map<string, { data: any; expires?: number }>();
  private config: CacheConfig = {};

  configure(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, data: any) {
    const config = this.config[key] || {};
    const expires = config.ttl ? Date.now() + config.ttl : undefined;
    
    this.cache.set(key, { data, expires });
    
    if (config.persistent) {
      localStorage.setItem(`cache_${key}`, JSON.stringify({ data, expires }));
    }
  }

  get(key: string) {
    let item = this.cache.get(key);
    
    if (!item && this.config[key]?.persistent) {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        item = JSON.parse(stored);
        if (item) {
          this.cache.set(key, item);
        }
      }
    }
    
    if (!item) return null;
    
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  clear() {
    this.cache.clear();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export const cacheService = new CacheService();