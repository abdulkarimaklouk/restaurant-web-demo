import { useState, useEffect } from 'react';

export type DayKey =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

export interface DaySchedule {
  enabled: boolean;
  openTime: string;  // 24-hour HH:mm
  closeTime: string; // 24-hour HH:mm
}

export type WorkingHours = Record<DayKey, DaySchedule>;

export const DAYS_ORDER: DayKey[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

export const JS_DAY_TO_KEY: Record<number, DayKey> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export const PREV_DAY_MAP: Record<DayKey, DayKey> = {
  saturday: 'friday',
  sunday: 'saturday',
  monday: 'sunday',
  tuesday: 'monday',
  wednesday: 'tuesday',
  thursday: 'wednesday',
  friday: 'thursday',
};

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  saturday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
  sunday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
  monday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
  tuesday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
  wednesday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
  thursday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
  friday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
};

export const STORAGE_KEY_WORKING_HOURS = 'restaurant_working_hours';

/**
 * Format 24-hour "HH:mm" time to localized 12-hour format
 * Examples:
 *   "09:00", ar -> "09:00 ص"
 *   "23:00", ar -> "11:00 م"
 *   "09:00", en -> "09:00 AM"
 *   "23:00", en -> "11:00 PM"
 */
export function formatTime12h(timeStr: string, isArabic: boolean): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;

  const isPm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const hFormatted = String(h12).padStart(2, '0');

  const period = isArabic ? (isPm ? 'م' : 'ص') : (isPm ? 'PM' : 'AM');
  return `${hFormatted}:${m} ${period}`;
}

/**
 * Evaluates whether the current local time is within the configured schedule,
 * accounting for:
 * 1. Disabled days
 * 2. Regular same-day interval (openTime < closeTime)
 * 3. Overnight intervals extending past midnight (openTime > closeTime)
 * 4. Yesterday's overnight interval still active past midnight this morning
 */
export function isWithinWorkingHours(
  schedule: WorkingHours,
  date: Date = new Date()
): {
  isOpen: boolean;
  activeShiftClosingTime?: string;
} {
  const dayNum = date.getDay();
  const todayKey = JS_DAY_TO_KEY[dayNum];
  const yesterdayKey = PREV_DAY_MAP[todayKey];

  const nowHours = String(date.getHours()).padStart(2, '0');
  const nowMinutes = String(date.getMinutes()).padStart(2, '0');
  const currentTime = `${nowHours}:${nowMinutes}`;

  // 1. Check if yesterday's shift is currently spilling over past midnight into this morning
  const yesterdaySchedule = schedule[yesterdayKey];
  if (yesterdaySchedule && yesterdaySchedule.enabled) {
    const { openTime, closeTime } = yesterdaySchedule;
    if (openTime > closeTime) {
      // Overnight shift: open from openTime yesterday until closeTime this morning
      if (currentTime < closeTime) {
        return { isOpen: true, activeShiftClosingTime: closeTime };
      }
    }
  }

  // 2. Check today's shift
  const todaySchedule = schedule[todayKey];
  if (todaySchedule && todaySchedule.enabled) {
    const { openTime, closeTime } = todaySchedule;
    if (openTime < closeTime) {
      // Normal interval within same day
      if (currentTime >= openTime && currentTime < closeTime) {
        return { isOpen: true, activeShiftClosingTime: closeTime };
      }
    } else if (openTime > closeTime) {
      // Overnight interval starting today
      if (currentTime >= openTime) {
        return { isOpen: true, activeShiftClosingTime: closeTime };
      }
    } else {
      // Boundary identical: 24h open
      return { isOpen: true, activeShiftClosingTime: closeTime };
    }
  }

  return { isOpen: false };
}

/**
 * Calculates effective restaurant status integrating manual override and working hours:
 * - If manualIsOpen is false -> closed regardless of schedule
 * - If manualIsOpen is true -> effective status determined by working hours
 */
export function getEffectiveRestaurantStatus(
  manualIsOpen: boolean,
  schedule: WorkingHours,
  date: Date = new Date()
): {
  isEffectiveOpen: boolean;
  reason: 'manual_closed' | 'schedule_closed' | 'open';
  activeShiftClosingTime?: string;
} {
  if (!manualIsOpen) {
    return { isEffectiveOpen: false, reason: 'manual_closed' };
  }

  const { isOpen, activeShiftClosingTime } = isWithinWorkingHours(schedule, date);
  if (!isOpen) {
    return { isEffectiveOpen: false, reason: 'schedule_closed' };
  }

  return { isEffectiveOpen: true, reason: 'open', activeShiftClosingTime };
}

class WorkingHoursStore {
  private hours: WorkingHours;
  private listeners: Set<() => void> = new Set();
  private testDate: Date | null = null;
  private timerId: number | null = null;

  constructor() {
    this.hours = this.readFromStorage();

    // Check once per minute for schedule boundary crossing
    if (typeof window !== 'undefined') {
      this.timerId = window.setInterval(() => {
        this.notify();
      }, 60000);

      // Expose test helper on window for automated CDP testing
      (window as unknown as { __setWorkingHoursTestDate?: (d: string | null) => void }).__setWorkingHoursTestDate =
        (isoString: string | null) => {
          this.setTestDate(isoString ? new Date(isoString) : null);
        };
    }
  }

  public destroy(): void {
    if (this.timerId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.listeners.clear();
  }

  public setTestDate(date: Date | null): void {
    this.testDate = date;
    this.notify();
  }

  public getCurrentDate(): Date {
    return this.testDate ? new Date(this.testDate.getTime()) : new Date();
  }

  private readFromStorage(): WorkingHours {
    if (typeof window === 'undefined' || !window.localStorage) {
      return JSON.parse(JSON.stringify(DEFAULT_WORKING_HOURS));
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_WORKING_HOURS);
      if (!raw) {
        return JSON.parse(JSON.stringify(DEFAULT_WORKING_HOURS));
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const validated: Partial<WorkingHours> = {};
        let isValid = true;

        for (const day of DAYS_ORDER) {
          const item = parsed[day];
          if (
            item &&
            typeof item === 'object' &&
            typeof item.enabled === 'boolean' &&
            typeof item.openTime === 'string' &&
            typeof item.closeTime === 'string'
          ) {
            validated[day] = {
              enabled: item.enabled,
              openTime: item.openTime,
              closeTime: item.closeTime,
            };
          } else {
            isValid = false;
            break;
          }
        }

        if (isValid) {
          return validated as WorkingHours;
        }
      }
    } catch (e) {
      console.error('Failed to parse restaurant_working_hours from localStorage:', e);
    }

    return JSON.parse(JSON.stringify(DEFAULT_WORKING_HOURS));
  }

  public getWorkingHours(): WorkingHours {
    return JSON.parse(JSON.stringify(this.hours));
  }

  public updateWorkingHours(updated: WorkingHours): void {
    this.hours = JSON.parse(JSON.stringify(updated));

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_WORKING_HOURS, JSON.stringify(this.hours));
      } catch (e) {
        console.error('Failed to persist restaurant_working_hours to localStorage:', e);
      }
    }

    this.notify();
  }

  public resetToDefault(): void {
    this.hours = JSON.parse(JSON.stringify(DEFAULT_WORKING_HOURS));
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_WORKING_HOURS);
    }
    this.notify();
  }

  public isCurrentlyOpen(): boolean {
    return isWithinWorkingHours(this.hours, this.getCurrentDate()).isOpen;
  }

  public getEffectiveStatus(manualIsOpen: boolean) {
    return getEffectiveRestaurantStatus(manualIsOpen, this.hours, this.getCurrentDate());
  }

  public getTodaySchedule(): { dayKey: DayKey; schedule: DaySchedule } {
    const date = this.getCurrentDate();
    const dayKey = JS_DAY_TO_KEY[date.getDay()];
    return { dayKey, schedule: this.hours[dayKey] };
  }

  public getTodaySummary(isArabic: boolean): string {
    const { schedule } = this.getTodaySchedule();
    if (!schedule.enabled) {
      return isArabic ? 'مغلق اليوم' : 'Closed today';
    }

    const openFormatted = formatTime12h(schedule.openTime, isArabic);
    const closeFormatted = formatTime12h(schedule.closeTime, isArabic);
    const hoursInterval = `${openFormatted} - ${closeFormatted}`;

    const isCurrentOpen = this.isCurrentlyOpen();
    const statusPrefix = isArabic
      ? isCurrentOpen
        ? 'مفتوح'
        : 'مغلق'
      : isCurrentOpen
      ? 'Open'
      : 'Closed';

    return `${statusPrefix} • ${hoursInterval}`;
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

export const workingHoursStore = new WorkingHoursStore();

export function useWorkingHoursStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return workingHoursStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return {
    workingHours: workingHoursStore.getWorkingHours(),
    updateWorkingHours: (hours: WorkingHours) => workingHoursStore.updateWorkingHours(hours),
    resetToDefault: () => workingHoursStore.resetToDefault(),
    isCurrentlyOpen: () => workingHoursStore.isCurrentlyOpen(),
    getEffectiveStatus: (manualIsOpen: boolean) =>
      workingHoursStore.getEffectiveStatus(manualIsOpen),
    getTodaySchedule: () => workingHoursStore.getTodaySchedule(),
    getTodaySummary: (isArabic: boolean) => workingHoursStore.getTodaySummary(isArabic),
    setTestDate: (d: Date | null) => workingHoursStore.setTestDate(d),
  };
}
