'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function VersionManager() {
  useEffect(() => {
    // Only run in production to avoid dev loop
    if (process.env.NODE_ENV !== 'production') return;

    const checkVersion = async () => {
      try {
        // Fetch version.json with timestamp to bypass browser cache
        const res = await fetch(`/version.json?t=${Date.now()}`);
        if (!res.ok) return;

        const data = await res.json();
        const serverVersion = data.version;
        const localVersion = localStorage.getItem('app_version');

        // Initial setup
        if (!localVersion) {
          localStorage.setItem('app_version', serverVersion);
          return;
        }

        // Version mismatch logic
        if (serverVersion !== localVersion) {
          logger.info(`Version update detected: ${localVersion} -> ${serverVersion}`, {
            category: 'system',
            metadata: { oldVersion: localVersion, newVersion: serverVersion },
          });

          // 1. Unregister Service Worker
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }

          // 2. Clear Caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          }

          // 3. Update Local Storage
          localStorage.setItem('app_version', serverVersion);

          // 4. Hard Reload to get fresh HTML/JS
          window.location.reload();
        }
      } catch (err) {
        logger.error('Version check failed', err, { category: 'system' });
      }
    };

    // Check immediately on mount
    checkVersion();

    // Optional: Check every hour if tab stays open
    // const interval = setInterval(checkVersion, 60 * 60 * 1000);
    // return () => clearInterval(interval);
  }, []);

  return null; // Component renders nothing
}
