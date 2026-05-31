import { useSettingsStore } from '@/store/useSettingsStore';

export function notifyLockModalOpen(modalType: 'premium' | 'payment') {
  if (typeof window === 'undefined') return;

  try {
    const cacheKey = `mppolice_lock_notify_${modalType}`;
    const lastSent = sessionStorage.getItem(cacheKey);
    if (lastSent && Date.now() - parseInt(lastSent, 10) < 60 * 1000) {
      return; 
    }
    sessionStorage.setItem(cacheKey, Date.now().toString());

    const { user } = useSettingsStore.getState();
    const guestName = localStorage.getItem('mppolice_guest_name'); 

    const getDeviceType = (): string => {
      const width = window.innerWidth;
      if (width < 768) return 'Mobile';
      if (width < 1024) return 'Tablet';
      return 'Desktop';
    };

    const payload = {
      modalType,
      path: window.location.pathname + window.location.search,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: (user as any).phone,
            role: user.role,
            planTier: user.planTier,
          }
        : null,
      guestName: guestName,
      device: getDeviceType(),
      userAgent: navigator.userAgent,
    };

    const body = JSON.stringify(payload);
    const url = '/api/notify/lock-modal';

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Completely silent
  }
}
