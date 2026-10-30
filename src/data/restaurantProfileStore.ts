import { useState, useEffect } from 'react';
import i18n from '../i18n';

export interface RestaurantProfile {
  name: string;
  branch: string;
  isOpen: boolean;
}

export const STORAGE_KEY_RESTAURANT_PROFILE = 'restaurant_profile';

class RestaurantProfileStore {
  private customProfile: RestaurantProfile | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.customProfile = this.readFromStorage();

    // Re-render components on language change if no custom profile was saved
    i18n.on('languageChanged', () => {
      if (!this.customProfile) {
        this.notify();
      }
    });
  }

  private readFromStorage(): RestaurantProfile | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_RESTAURANT_PROFILE);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.name === 'string' &&
        typeof parsed.branch === 'string' &&
        typeof parsed.isOpen === 'boolean'
      ) {
        const name = parsed.name.trim();
        const branch = parsed.branch.trim();
        if (name && branch) {
          return {
            name,
            branch,
            isOpen: parsed.isOpen,
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse restaurant_profile from localStorage:', e);
    }
    return null;
  }

  public getProfile(): RestaurantProfile {
    if (this.customProfile) {
      return this.customProfile;
    }

    // Default template when no custom profile is saved
    const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');
    return {
      name: isArabic ? 'مطعم الأطايب' : 'Good Food',
      branch: isArabic ? 'فرع الحرم الجامعي' : 'Campus Branch',
      isOpen: true,
    };
  }

  public hasCustomProfile(): boolean {
    return this.customProfile !== null;
  }

  public updateProfile(updated: RestaurantProfile): void {
    const sanitized: RestaurantProfile = {
      name: updated.name.trim(),
      branch: updated.branch.trim(),
      isOpen: updated.isOpen,
    };

    this.customProfile = sanitized;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_RESTAURANT_PROFILE, JSON.stringify(sanitized));
      } catch (e) {
        console.error('Failed to persist restaurant_profile to localStorage:', e);
      }
    }

    this.notify();
  }

  public resetToDefault(): void {
    this.customProfile = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_RESTAURANT_PROFILE);
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
    this.listeners.forEach((l) => l());
  }
}

export const restaurantProfileStore = new RestaurantProfileStore();

export function useRestaurantProfileStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return restaurantProfileStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return {
    profile: restaurantProfileStore.getProfile(),
    hasCustomProfile: restaurantProfileStore.hasCustomProfile(),
    updateProfile: (profile: RestaurantProfile) => restaurantProfileStore.updateProfile(profile),
    resetToDefault: () => restaurantProfileStore.resetToDefault(),
  };
}

