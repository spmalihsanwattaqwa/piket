/**
 * Utility to detect mobile devices and installed mobile PWA applications.
 * Enforces strict user role for mobile/HP installations as requested.
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check user agent for mobile indicators
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);

  // Check touch capabilities with compact viewport size, or standard mobile width
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 850;

  return isMobileUA || (hasTouch && isSmallScreen) || window.innerWidth < 768;
}

export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  const hasPwaParam = new URLSearchParams(window.location.search).get('role') === 'piket';

  return isStandalone || hasPwaParam;
}

/**
 * Returns true if running as an app on HP/mobile
 */
export function isMobileApp(): boolean {
  return isMobileDevice() || isInstalledPWA();
}
