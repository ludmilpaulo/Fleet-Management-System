import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiCache {
  private cachePrefix = 'api_cache_';
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${this.cachePrefix}${endpoint}_${paramString}`;
  }

  async get<T>(endpoint: string, params?: any): Promise<T | null> {
    try {
      const key = this.getCacheKey(endpoint, params);
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > entry.timestamp + entry.expiry) {
        await this.remove(endpoint, params);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('[ApiCache] Error getting cache:', error);
      return null;
    }
  }

  async set<T>(endpoint: string, data: T, ttl?: number, params?: any): Promise<void> {
    try {
      const key = this.getCacheKey(endpoint, params);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: ttl || this.defaultTTL,
      };

      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('[ApiCache] Error setting cache:', error);
    }
  }

  async remove(endpoint: string, params?: any): Promise<void> {
    try {
      const key = this.getCacheKey(endpoint, params);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[ApiCache] Error removing cache:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('[ApiCache] Error clearing cache:', error);
    }
  }

  // Invalidate cache for specific endpoint pattern
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.cachePrefix) && key.includes(pattern)
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('[ApiCache] Error invalidating cache:', error);
    }
  }
}

export const apiCache = new ApiCache();

