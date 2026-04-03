/**
 * 📱 CROSS-BROWSER FULLSCREEN API
 * 
 * Safari iOS, some Android browsers don't support standard requestFullscreen.
 * This utility provides fallback methods for maximum compatibility.
 */

interface FullscreenElement {
  requestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument {
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

/**
 * 🔄 Safe Fullscreen Request with Cross-Browser Support
 * 
 * Tries multiple vendor prefixes and gracefully handles failures.
 * Returns success status so calling code can decide what to do.
 */
export async function requestFullscreenSafely(element?: FullscreenElement): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false; // Server-side rendering
    }

    const target = (element || document.documentElement) as FullscreenElement;
    
    // Try standard method first
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    }
    
    // Safari iOS/macOS
    if (target.webkitRequestFullscreen) {
      await target.webkitRequestFullscreen();
      return true;
    }
    
    // Firefox
    if (target.mozRequestFullScreen) {
      await target.mozRequestFullScreen();
      return true;
    }
    
    // IE/Edge
    if (target.msRequestFullscreen) {
      await target.msRequestFullscreen();
      return true;
    }
    
    // No fullscreen API available
    return false;
    
  } catch (error) {
    // User denied permission, or API not available
    console.warn('Fullscreen request failed:', error);
    return false;
  }
}

/**
 * 🔄 Safe Fullscreen Exit with Cross-Browser Support
 */
export async function exitFullscreenSafely(): Promise<boolean> {
  try {
    if (typeof document === 'undefined') return false;
    
    const doc = document as FullscreenDocument;
    
    // Check if actually in fullscreen first
    if (!isFullscreenActive()) return true;
    
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    }
    
    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    }
    
    if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    }
    
    if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.warn('Exit fullscreen failed:', error);
    return false;
  }
}

/**
 * 📱 Check if currently in fullscreen mode
 */
export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  
  const doc = document as FullscreenDocument;
  
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

/**
 * 📱 Check if fullscreen is supported on this device
 */
export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  
  const element = document.documentElement as FullscreenElement;
  
  return !!(
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullscreen
  );
}