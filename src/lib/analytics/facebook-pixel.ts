type StandardEvent =
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Purchase'
  | 'Schedule'
  | 'Search'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'ViewContent';

// Ensure the fbq function is available on the window object
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Track a Facebook Pixel Standard Event
 * @param eventName The standard event to track
 * @param data Optional parameters for the event (e.g., value, currency)
 */
export const trackFbStandardEvent = (eventName: StandardEvent, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  } else {
    console.debug(
      '[Facebook Pixel] Standard Event "' +
        eventName +
        '" triggered (not sent because fbq is missing)',
      data
    );
  }
};

/**
 * Track a Facebook Pixel Custom Event
 * @param eventName The custom event name (your own defined name)
 * @param data Optional parameters for the event
 */
export const trackFbCustomEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, data);
  } else {
    console.debug(
      '[Facebook Pixel] Custom Event "' +
        eventName +
        '" triggered (not sent because fbq is missing)',
      data
    );
  }
};
