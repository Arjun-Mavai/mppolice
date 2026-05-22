import { useEffect } from 'react';

export function useDisableSelection(
  ref: React.RefObject<HTMLElement | null>,
  requireLogin: boolean
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !requireLogin) return;

    // Prevent default actions for copy, cut, paste, and selectstart
    const handlePreventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Prevent context menu (right click)
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Attach event listeners
    el.addEventListener('copy', handlePreventDefault);
    el.addEventListener('cut', handlePreventDefault);
    el.addEventListener('paste', handlePreventDefault);
    el.addEventListener('selectstart', handlePreventDefault);
    el.addEventListener('contextmenu', handleContextMenu);

    // Apply inline CSS to disable selection completely
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none'; // For Safari
    (el.style as any).msUserSelect = 'none'; // For older IE/Edge
    (el.style as any).MozUserSelect = 'none'; // For older Firefox

    // Cleanup function
    return () => {
      el.removeEventListener('copy', handlePreventDefault);
      el.removeEventListener('cut', handlePreventDefault);
      el.removeEventListener('paste', handlePreventDefault);
      el.removeEventListener('selectstart', handlePreventDefault);
      el.removeEventListener('contextmenu', handleContextMenu);

      // Revert inline styles
      el.style.userSelect = '';
      el.style.webkitUserSelect = '';
      (el.style as any).msUserSelect = '';
      (el.style as any).MozUserSelect = '';
    };
  }, [ref, requireLogin]);
}
