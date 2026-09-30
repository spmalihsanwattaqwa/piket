import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [autoPromptAttempted, setAutoPromptAttempted] = useState(false);

  // Check if current URL requests automatic install
  const checkIsInstallLink = () => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('install') === '1' || params.get('install') === 'auto' || params.get('action') === 'install';
  };

  const [isInstallRequested] = useState<boolean>(checkIsInstallLink);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  useEffect(() => {
    // Detect standalone mode (already installed as APK/PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Auto-install trigger if opened with install link on mobile!
      const params = new URLSearchParams(window.location.search);
      const isAuto = params.get('install') === '1' || params.get('install') === 'auto' || params.get('action') === 'install';

      if (isAuto && !isStandalone && !autoPromptAttempted) {
        setAutoPromptAttempted(true);
        // Small delay to ensure browser window is ready
        setTimeout(async () => {
          try {
            await promptEvent.prompt();
          } catch (err) {
            console.warn('Auto prompt deferred:', err);
          }
        }, 600);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoPromptAttempted]);

  const getInstallUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?role=piket&install=1`;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isInstallRequested,
    install,
    getInstallUrl,
  };
}
