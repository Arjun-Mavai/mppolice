/**
 * 📊 SAFE ANALYTICS HELPERS
 * 
 * Prevents crashes from missing analytics functions (gtag, postEvent, etc.)
 * Commonly happens with ad blockers, privacy tools, or service worker issues.
 */

/**
 * 🛡️ Safe Google Analytics Event
 * 
 * Prevents "gtag is not defined" errors
 */
export function safeGtag(command: string, ...args: any[]) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(command, ...args);
    }
  } catch (error) {
    // Analytics failed - log but don't crash app
    console.warn('Analytics gtag failed:', error);
  }
}

/**
 * 🛡️ Safe postEvent (Service Worker Analytics)
 * 
 * Prevents "postEvent: Method not found" errors
 */
export function safePostEvent(eventName: string, data?: any) {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active && typeof registration.active.postMessage === 'function') {
          registration.active.postMessage({
            type: 'ANALYTICS_EVENT',
            event: eventName,
            data
          });
        }
      }).catch(() => {
        // Service worker not available - that's fine
      });
    }
  } catch (error) {
    console.warn('Analytics postEvent failed:', error);
  }
}

/**
 * 🛡️ Safe Facebook Pixel Event
 */
export function safeFbq(command: string, ...args: any[]) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq(command, ...args);
    }
  } catch (error) {
    console.warn('Facebook Pixel failed:', error);
  }
}

/**
 * 🛡️ Safe dataLayer Push (GTM)
 */
export function safeDataLayerPush(data: any) {
  try {
    if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(data);
    }
  } catch (error) {
    console.warn('DataLayer push failed:', error);
  }
}

/**
 * 🛡️ Generic Safe Analytics Call
 * 
 * For any custom analytics function that might not exist
 */
export function safeAnalyticsCall(fn: () => void, fallback?: () => void) {
  try {
    fn();
  } catch (error) {
    console.warn('Analytics call failed:', error);
    if (fallback) {
      try {
        fallback();
      } catch {
        // Even fallback failed - give up gracefully
      }
    }
  }
}

// TypeScript declarations for global analytics objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}