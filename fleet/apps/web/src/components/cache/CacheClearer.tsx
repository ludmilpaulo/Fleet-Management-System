'use client';

import { useEffect } from 'react';

export function CacheClearer() {
  useEffect(() => {
    const clearBrowserCache = async () => {
      try {
        // Clear localStorage (except for essential items like auth tokens)
        const authToken = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        localStorage.clear();
        
        // Restore essential auth tokens if they exist
        if (authToken) {
          localStorage.setItem('auth_token', authToken);
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear IndexedDB
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases();
            await Promise.all(
              databases.map(db => {
                return new Promise<void>((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name || '');
                  deleteReq.onsuccess = () => resolve();
                  deleteReq.onerror = () => reject(deleteReq.error);
                  deleteReq.onblocked = () => resolve(); // Still resolve if blocked
                });
              })
            );
          } catch (error) {
            console.warn('Error clearing IndexedDB:', error);
          }
        }

        // Clear Cache Storage
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
          } catch (error) {
            console.warn('Error clearing cache storage:', error);
          }
        }

        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
              registrations.map(registration => registration.unregister())
            );
          } catch (error) {
            console.warn('Error unregistering service workers:', error);
          }
        }

        console.log('Browser cache and storage cleared successfully');
      } catch (error) {
        console.error('Error clearing browser cache:', error);
      }
    };

    // Clear cache on app load
    clearBrowserCache();
  }, []);

  return null; // This component doesn't render anything
}
