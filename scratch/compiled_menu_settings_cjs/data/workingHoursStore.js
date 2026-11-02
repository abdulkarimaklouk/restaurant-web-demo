"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingHoursStore = exports.WorkingHoursStore = exports.STORAGE_KEY_WORKING_HOURS = exports.DEFAULT_WORKING_HOURS = exports.PREV_DAY_MAP = exports.JS_DAY_TO_KEY = exports.DAYS_ORDER = void 0;
exports.formatTime12h = formatTime12h;
exports.isWithinWorkingHours = isWithinWorkingHours;
exports.getEffectiveRestaurantStatus = getEffectiveRestaurantStatus;
exports.useWorkingHoursStore = useWorkingHoursStore;
const react_1 = require("react");
exports.DAYS_ORDER = [
    'saturday',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
];
exports.JS_DAY_TO_KEY = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};
exports.PREV_DAY_MAP = {
    saturday: 'friday',
    sunday: 'saturday',
    monday: 'sunday',
    tuesday: 'monday',
    wednesday: 'tuesday',
    thursday: 'wednesday',
    friday: 'thursday',
};
exports.DEFAULT_WORKING_HOURS = {
    saturday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
    sunday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
    monday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
    tuesday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
    wednesday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
    thursday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
    friday: { enabled: true, openTime: '09:00', closeTime: '23:00' },
};
exports.STORAGE_KEY_WORKING_HOURS = 'restaurant_working_hours';
/**
 * Format 24-hour "HH:mm" time to localized 12-hour format
 * Examples:
 *   "09:00", ar -> "09:00 ص"
 *   "23:00", ar -> "11:00 م"
 *   "09:00", en -> "09:00 AM"
 *   "23:00", en -> "11:00 PM"
 */
function formatTime12h(timeStr, isArabic) {
    if (!timeStr || !timeStr.includes(':'))
        return timeStr;
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h))
        return timeStr;
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
function isWithinWorkingHours(schedule, date = new Date()) {
    const dayNum = date.getDay();
    const todayKey = exports.JS_DAY_TO_KEY[dayNum];
    const yesterdayKey = exports.PREV_DAY_MAP[todayKey];
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
        }
        else if (openTime > closeTime) {
            // Overnight interval starting today
            if (currentTime >= openTime) {
                return { isOpen: true, activeShiftClosingTime: closeTime };
            }
        }
        else {
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
function getEffectiveRestaurantStatus(manualIsOpen, schedule, date = new Date()) {
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
    constructor() {
        this.listeners = new Set();
        this.testDate = null;
        this.timerId = null;
        this.hours = this.readFromStorage();
        // Check once per minute for schedule boundary crossing
        if (typeof window !== 'undefined') {
            this.timerId = window.setInterval(() => {
                this.notify();
            }, 60000);
            // Expose test helper on window for automated CDP testing
            window.__setWorkingHoursTestDate =
                (isoString) => {
                    this.setTestDate(isoString ? new Date(isoString) : null);
                };
        }
    }
    destroy() {
        if (this.timerId !== null && typeof window !== 'undefined') {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }
        this.listeners.clear();
    }
    setTestDate(date) {
        this.testDate = date;
        this.notify();
    }
    getCurrentDate() {
        return this.testDate ? new Date(this.testDate.getTime()) : new Date();
    }
    readFromStorage() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return JSON.parse(JSON.stringify(exports.DEFAULT_WORKING_HOURS));
        }
        try {
            const raw = window.localStorage.getItem(exports.STORAGE_KEY_WORKING_HOURS);
            if (!raw) {
                return JSON.parse(JSON.stringify(exports.DEFAULT_WORKING_HOURS));
            }
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                const validated = {};
                let isValid = true;
                for (const day of exports.DAYS_ORDER) {
                    const item = parsed[day];
                    if (item &&
                        typeof item === 'object' &&
                        typeof item.enabled === 'boolean' &&
                        typeof item.openTime === 'string' &&
                        typeof item.closeTime === 'string') {
                        validated[day] = {
                            enabled: item.enabled,
                            openTime: item.openTime,
                            closeTime: item.closeTime,
                        };
                    }
                    else {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    return validated;
                }
            }
        }
        catch (e) {
            console.error('Failed to parse restaurant_working_hours from localStorage:', e);
        }
        return JSON.parse(JSON.stringify(exports.DEFAULT_WORKING_HOURS));
    }
    getWorkingHours() {
        return JSON.parse(JSON.stringify(this.hours));
    }
    updateWorkingHours(updated) {
        this.hours = JSON.parse(JSON.stringify(updated));
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                window.localStorage.setItem(exports.STORAGE_KEY_WORKING_HOURS, JSON.stringify(this.hours));
            }
            catch (e) {
                console.error('Failed to persist restaurant_working_hours to localStorage:', e);
            }
        }
        this.notify();
    }
    resetToDefault() {
        this.hours = JSON.parse(JSON.stringify(exports.DEFAULT_WORKING_HOURS));
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(exports.STORAGE_KEY_WORKING_HOURS);
        }
        this.notify();
    }
    isCurrentlyOpen() {
        return isWithinWorkingHours(this.hours, this.getCurrentDate()).isOpen;
    }
    getEffectiveStatus(manualIsOpen) {
        return getEffectiveRestaurantStatus(manualIsOpen, this.hours, this.getCurrentDate());
    }
    getTodaySchedule() {
        const date = this.getCurrentDate();
        const dayKey = exports.JS_DAY_TO_KEY[date.getDay()];
        return { dayKey, schedule: this.hours[dayKey] };
    }
    getTodaySummary(isArabic) {
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
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        this.listeners.forEach((l) => l());
    }
}
exports.WorkingHoursStore = WorkingHoursStore;
exports.workingHoursStore = new WorkingHoursStore();
function useWorkingHoursStore() {
    const [, setTick] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        return exports.workingHoursStore.subscribe(() => {
            setTick((t) => t + 1);
        });
    }, []);
    return {
        workingHours: exports.workingHoursStore.getWorkingHours(),
        updateWorkingHours: (hours) => exports.workingHoursStore.updateWorkingHours(hours),
        resetToDefault: () => exports.workingHoursStore.resetToDefault(),
        isCurrentlyOpen: () => exports.workingHoursStore.isCurrentlyOpen(),
        getEffectiveStatus: (manualIsOpen) => exports.workingHoursStore.getEffectiveStatus(manualIsOpen),
        getTodaySchedule: () => exports.workingHoursStore.getTodaySchedule(),
        getTodaySummary: (isArabic) => exports.workingHoursStore.getTodaySummary(isArabic),
        setTestDate: (d) => exports.workingHoursStore.setTestDate(d),
    };
}
