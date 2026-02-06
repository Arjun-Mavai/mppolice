import { useState, useEffect } from 'react';
import { logger } from "@/lib/logger";

/**
 * Interface for the BeforeInstallPromptEvent
 * This event is not yet standard, so we define it manually.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Custom hook to handle PWA installation logic and detection.
 * Provides 'isPwaInstalled' status and an 'installPwa' function.
 */
export function usePwa() {
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (Installed)
    const checkStandalone = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true; // For iOS Safari
      
      setIsPwaInstalled(isStandalone);
    };

    checkStandalone();
    
    // Listen for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
        setIsPwaInstalled(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    // 2. Capture the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      // We cast it because the event listener uses the standard Event type
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      logger.debug("PWA Install Prompt captured");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // 3. Register Service Worker (Manual Registration)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(
                (registration) => {
                    logger.debug('ServiceWorker registration successful with scope: ', registration.scope);
                },
                (err) => {
                    logger.error('ServiceWorker registration failed: ', err);
                }
            );
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) {
        logger.debug("Install prompt not available");
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    logger.info(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isPwaInstalled, isInstallable, installPwa };
}
