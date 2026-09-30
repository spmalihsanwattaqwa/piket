import { playPeriodChime } from './audio';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function sendPeriodNotification(periodName: string, unrecordedCount: number): void {
  // Always play the chime
  playPeriodChime();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const title = `⏰ Pengingat Absen Piket: ${periodName}`;
      const body = unrecordedCount > 0
        ? `Saat ini awal jam pelajaran ${periodName}. Masih ada ${unrecordedCount} guru yang belum diabsen. Mohon segera dicek.`
        : `Jam pelajaran ${periodName} telah dimulai. Silakan periksa kehadiran guru di kelas masing-masing.`;

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `period-reminder-${periodName}`,
      });
    } catch (err) {
      console.warn('Failed to send browser notification:', err);
    }
  }
}
