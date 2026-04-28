"use client";
import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch {
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") return;
    
    // Try service worker notifications first (works in background)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          ...options,
        });
      }).catch(() => {
        // Fallback to regular notification
        new Notification(title, { icon: "/icon-192.png", ...options });
      });
    } else {
      new Notification(title, { icon: "/icon-192.png", ...options });
    }
  }, [isSupported, permission]);

  const scheduleReminder = useCallback((title: string, body: string, delayMs: number) => {
    if (permission !== "granted") return null;
    const timeoutId = setTimeout(() => {
      sendNotification(title, { body, tag: `reminder_${Date.now()}` });
    }, delayMs);
    return timeoutId;
  }, [permission, sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
  };
}
