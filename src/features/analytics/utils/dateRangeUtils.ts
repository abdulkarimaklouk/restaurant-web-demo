import { AnalyticsDatePreset, DateRange } from '../types';

/**
 * Normalizes any timestamp or Date into a valid Date object.
 */
export function normalizeDate(input?: number | Date | null): Date {
  if (!input) return new Date();
  return input instanceof Date ? new Date(input.getTime()) : new Date(input);
}

/**
 * Checks whether an order epoch timestamp falls strictly within [start, end).
 */
export function isTimestampInRange(timestamp: number, range: DateRange): boolean {
  return timestamp >= range.start && timestamp < range.end;
}

/**
 * Returns the number of days in a given calendar month (1-based or 0-based index handled).
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export interface DatePresetResolution {
  currentRange: DateRange;
  comparisonRange: DateRange | null;
}

/**
 * Resolves standard date presets ('today', 'week', 'month', 'custom') into deterministic
 * [start, end) epoch ranges along with their corresponding comparison periods.
 *
 * An optional `now` parameter allows deterministic evaluation for automated testing.
 */
export function resolveDatePreset(
  preset: AnalyticsDatePreset,
  nowInput?: number | Date | null,
  customStartInput?: number | Date | null,
  customEndInput?: number | Date | null
): DatePresetResolution {
  const ref = normalizeDate(nowInput);
  const nowMs = ref.getTime();

  switch (preset) {
    case 'today': {
      // Today: Local midnight to start of tomorrow
      const todayStart = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0).getTime();
      const todayEnd = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + 1, 0, 0, 0, 0).getTime();

      // Comparison: Yesterday, using equivalent elapsed time
      const yesterdayStart = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1, 0, 0, 0, 0).getTime();
      const elapsedToday = Math.max(0, nowMs - todayStart);
      const yesterdayCompEnd = yesterdayStart + elapsedToday;

      return {
        currentRange: {
          start: todayStart,
          end: todayEnd,
          preset: 'today',
          label: 'today',
        },
        comparisonRange: {
          start: yesterdayStart,
          end: yesterdayCompEnd,
          preset: 'today',
          label: 'yesterday',
        },
      };
    }

    case 'week': {
      // Business week: Saturday 00:00:00 through Friday 23:59:59.999 (represented as next Sat 00:00)
      // JS getDay(): 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
      // Distance back to previous or current Saturday: (getDay() + 1) % 7
      const dayOfWeek = ref.getDay();
      const daysSinceSaturday = (dayOfWeek + 1) % 7;

      const saturdayDate = new Date(
        ref.getFullYear(),
        ref.getMonth(),
        ref.getDate() - daysSinceSaturday,
        0,
        0,
        0,
        0
      );
      const weekStart = saturdayDate.getTime();

      const nextSaturdayDate = new Date(
        saturdayDate.getFullYear(),
        saturdayDate.getMonth(),
        saturdayDate.getDate() + 7,
        0,
        0,
        0,
        0
      );
      const weekEnd = nextSaturdayDate.getTime();

      // Comparison: Corresponding elapsed period of previous Saturday-to-Friday week
      const prevSaturdayDate = new Date(
        saturdayDate.getFullYear(),
        saturdayDate.getMonth(),
        saturdayDate.getDate() - 7,
        0,
        0,
        0,
        0
      );
      const prevWeekStart = prevSaturdayDate.getTime();
      const elapsedWeek = Math.max(0, nowMs - weekStart);
      const prevWeekCompEnd = prevWeekStart + elapsedWeek;

      return {
        currentRange: {
          start: weekStart,
          end: weekEnd,
          preset: 'week',
          label: 'thisWeek',
        },
        comparisonRange: {
          start: prevWeekStart,
          end: prevWeekCompEnd,
          preset: 'week',
          label: 'lastWeek',
        },
      };
    }

    case 'month': {
      // Month: 1st day of current month 00:00:00 to 1st day of next month 00:00:00
      const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0).getTime();
      const nextMonthStart = new Date(ref.getFullYear(), ref.getMonth() + 1, 1, 0, 0, 0, 0).getTime();

      // Comparison: Equivalent elapsed days in previous month
      const prevMonthYear = ref.getMonth() === 0 ? ref.getFullYear() - 1 : ref.getFullYear();
      const prevMonthIndex = ref.getMonth() === 0 ? 11 : ref.getMonth() - 1;
      const prevMonthStart = new Date(prevMonthYear, prevMonthIndex, 1, 0, 0, 0, 0).getTime();

      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);
      const targetDay = Math.min(ref.getDate(), daysInPrevMonth);

      const prevMonthCompEnd = new Date(
        prevMonthYear,
        prevMonthIndex,
        targetDay,
        ref.getHours(),
        ref.getMinutes(),
        ref.getSeconds(),
        ref.getMilliseconds()
      ).getTime();

      return {
        currentRange: {
          start: monthStart,
          end: nextMonthStart,
          preset: 'month',
          label: 'thisMonth',
        },
        comparisonRange: {
          start: prevMonthStart,
          end: prevMonthCompEnd,
          preset: 'month',
          label: 'lastMonth',
        },
      };
    }

    case 'custom': {
      const s = normalizeDate(customStartInput || nowInput);
      const e = normalizeDate(customEndInput || customStartInput || nowInput);

      // Start date inclusive at 00:00:00
      const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0).getTime();
      // End date inclusive represented via exclusive next-day boundary at 00:00:00
      const end = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1, 0, 0, 0, 0).getTime();

      const duration = Math.max(86400000, end - start);
      // Comparison period has the exact same duration immediately before the selected range
      const compEnd = start;
      const compStart = start - duration;

      return {
        currentRange: {
          start,
          end,
          preset: 'custom',
          label: 'custom',
        },
        comparisonRange: {
          start: compStart,
          end: compEnd,
          preset: 'custom',
          label: 'previousPeriod',
        },
      };
    }
  }
}

export interface BucketTemplate {
  key: string;
  label: string;
  startTime: number;
  endTime: number;
}

/**
 * Generates regular time bucket intervals across a date range for chart rendering.
 */
export function generateChartBucketTemplates(
  preset: AnalyticsDatePreset,
  range: DateRange
): BucketTemplate[] {
  const buckets: BucketTemplate[] = [];

  switch (preset) {
    case 'today': {
      // 7 points matching approved reference: 10 AM to 10 PM at 2-hour intervals.
      // 1. The 10 AM bucket strictly represents 10:00–12:00.
      // 2. The remaining buckets represent consecutive 2-hour intervals through 10 PM (22:00–24:00).
      // 3. Orders outside displayed chart hours are tracked explicitly in outOfChartHours (never merged into 10 AM).
      const startDay = new Date(range.start);
      const points = [
        { h: 10, label: '10 AM', startH: 10, endH: 12 },
        { h: 12, label: '12 PM', startH: 12, endH: 14 },
        { h: 14, label: '2 PM', startH: 14, endH: 16 },
        { h: 16, label: '4 PM', startH: 16, endH: 18 },
        { h: 18, label: '6 PM', startH: 18, endH: 20 },
        { h: 20, label: '8 PM', startH: 20, endH: 22 },
        { h: 22, label: '10 PM', startH: 22, endH: 24 },
      ];

      for (const p of points) {
        const bStart = new Date(
          startDay.getFullYear(),
          startDay.getMonth(),
          startDay.getDate(),
          p.startH,
          0,
          0,
          0
        ).getTime();
        const bEnd = new Date(
          startDay.getFullYear(),
          startDay.getMonth(),
          startDay.getDate(),
          p.endH,
          0,
          0,
          0
        ).getTime();

        buckets.push({
          key: `hour-${p.h}`,
          label: p.label,
          startTime: bStart,
          endTime: bEnd,
        });
      }
      break;
    }

    case 'week': {
      // 7 daily intervals starting Saturday through Friday
      const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const weekStart = new Date(range.start);

      for (let i = 0; i < 7; i++) {
        const bStart = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + i,
          0,
          0,
          0,
          0
        ).getTime();
        const bEnd = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + i + 1,
          0,
          0,
          0,
          0
        ).getTime();

        buckets.push({
          key: `day-${i}`,
          label: dayNames[i],
          startTime: bStart,
          endTime: bEnd,
        });
      }
      break;
    }

    case 'month': {
      // Daily intervals from day 1 to last day of the calendar month
      const mStart = new Date(range.start);
      const totalDays = getDaysInMonth(mStart.getFullYear(), mStart.getMonth());

      for (let d = 1; d <= totalDays; d++) {
        const bStart = new Date(
          mStart.getFullYear(),
          mStart.getMonth(),
          d,
          0,
          0,
          0,
          0
        ).getTime();
        const bEnd = new Date(
          mStart.getFullYear(),
          mStart.getMonth(),
          d + 1,
          0,
          0,
          0,
          0
        ).getTime();

        buckets.push({
          key: `mday-${d}`,
          label: `${d}`,
          startTime: bStart,
          endTime: bEnd,
        });
      }
      break;
    }

    case 'custom': {
      const durationMs = range.end - range.start;
      const durationDays = Math.ceil(durationMs / 86400000);

      if (durationDays <= 1) {
        // 7 points matching approved reference: 10 AM to 10 PM
        const sDate = new Date(range.start);
        const points = [
          { h: 10, label: '10 AM', startH: 10, endH: 12 },
          { h: 12, label: '12 PM', startH: 12, endH: 14 },
          { h: 14, label: '2 PM', startH: 14, endH: 16 },
          { h: 16, label: '4 PM', startH: 16, endH: 18 },
          { h: 18, label: '6 PM', startH: 18, endH: 20 },
          { h: 20, label: '8 PM', startH: 20, endH: 22 },
          { h: 22, label: '10 PM', startH: 22, endH: 24 },
        ];
        for (const p of points) {
          const bStart = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), p.startH, 0, 0, 0).getTime();
          const bEnd = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), p.endH, 0, 0, 0).getTime();
          buckets.push({
            key: `custom-h-${p.h}`,
            label: p.label,
            startTime: bStart,
            endTime: bEnd,
          });
        }
      } else if (durationDays <= 31) {
        // Daily intervals
        const sDate = new Date(range.start);
        for (let i = 0; i < durationDays; i++) {
          const bStart = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + i, 0, 0, 0, 0).getTime();
          const bEnd = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + i + 1, 0, 0, 0, 0).getTime();
          const cur = new Date(bStart);
          buckets.push({
            key: `custom-d-${i}`,
            label: `${cur.getMonth() + 1}/${cur.getDate()}`,
            startTime: bStart,
            endTime: bEnd,
          });
        }
      } else {
        // Weekly intervals for longer ranges
        const weeksCount = Math.ceil(durationDays / 7);
        for (let w = 0; w < weeksCount; w++) {
          const bStart = range.start + w * 7 * 86400000;
          const bEnd = Math.min(range.end, bStart + 7 * 86400000);
          buckets.push({
            key: `custom-w-${w}`,
            label: `W${w + 1}`,
            startTime: bStart,
            endTime: bEnd,
          });
        }
      }
      break;
    }
  }

  return buckets;
}

