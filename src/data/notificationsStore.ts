import { useState, useEffect } from 'react';

export interface NotificationPreferences {
  newOrdersEnabled: boolean;
  paymentConfirmationsEnabled: boolean;
}

export const STORAGE_KEY_NOTIFICATION_PREFERENCES = 'notification_preferences';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  newOrdersEnabled: true,
  paymentConfirmationsEnabled: true,
};

class NotificationsStore {
  private preferences: NotificationPreferences;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.preferences = this.readFromStorage();
  }

  private readFromStorage(): NotificationPreferences {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_NOTIFICATION_PREFERENCES);
      if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.newOrdersEnabled === 'boolean' &&
        typeof parsed.paymentConfirmationsEnabled === 'boolean'
      ) {
        return {
          newOrdersEnabled: parsed.newOrdersEnabled,
          paymentConfirmationsEnabled: parsed.paymentConfirmationsEnabled,
        };
      }
    } catch (e) {
      console.error('Failed to parse notification_preferences from localStorage:', e);
    }

    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updated: NotificationPreferences): void {
    const sanitized: NotificationPreferences = {
      newOrdersEnabled: Boolean(updated.newOrdersEnabled),
      paymentConfirmationsEnabled: Boolean(updated.paymentConfirmationsEnabled),
    };

    this.preferences = sanitized;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY_NOTIFICATION_PREFERENCES,
          JSON.stringify(sanitized)
        );
      } catch (e) {
        console.error('Failed to persist notification_preferences to localStorage:', e);
      }
    }

    this.notify();
  }

  public resetToDefault(): void {
    this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY_NOTIFICATION_PREFERENCES);
      } catch (e) {
        console.error('Failed to remove notification_preferences from localStorage:', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in notifications listener:', e);
      }
    });
  }
}

export const notificationsStore = new NotificationsStore();

export function useNotificationsStore() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    notificationsStore.getPreferences()
  );

  useEffect(() => {
    return notificationsStore.subscribe(() => {
      setPreferences(notificationsStore.getPreferences());
    });
  }, []);

  return {
    preferences,
    updatePreferences: (prefs: NotificationPreferences) =>
      notificationsStore.updatePreferences(prefs),
    resetToDefault: () => notificationsStore.resetToDefault(),
  };
}

