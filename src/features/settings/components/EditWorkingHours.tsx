import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Info, Moon } from 'lucide-react';
import { ToastProps } from '../../../components/ui/Toast';
import {
  DayKey,
  DAYS_ORDER,
  WorkingHours,
  useWorkingHoursStore,
  formatTime12h,
} from '../../../data/workingHoursStore';
import './EditWorkingHours.css';

export interface EditWorkingHoursProps {
  onBack: () => void;
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const EditWorkingHours: React.FC<EditWorkingHoursProps> = ({
  onBack,
  onShowToast,
}) => {
  const { t, i18n } = useTranslation('settings');
  const { workingHours, updateWorkingHours } = useWorkingHoursStore();

  // Local form state initialized with current working hours
  const [schedule, setSchedule] = useState<WorkingHours>(() =>
    JSON.parse(JSON.stringify(workingHours))
  );

  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  const handleToggleDay = (dayKey: DayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
      },
    }));
  };

  const handleTimeChange = (
    dayKey: DayKey,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (const dayKey of DAYS_ORDER) {
      const day = schedule[dayKey];
      const dayName = t(`workingHours.days.${dayKey}`);

      if (day.enabled) {
        if (!day.openTime || !day.openTime.trim()) {
          onShowToast(
            t('workingHours.validation.openRequired', { day: dayName }),
            'warning'
          );
          return;
        }
        if (!day.closeTime || !day.closeTime.trim()) {
          onShowToast(
            t('workingHours.validation.closeRequired', { day: dayName }),
            'warning'
          );
          return;
        }
        if (day.openTime === day.closeTime) {
          onShowToast(
            t('workingHours.validation.sameTime', { day: dayName }),
            'warning'
          );
          return;
        }
      }
    }

    // Save and persist
    updateWorkingHours(schedule);
    onShowToast(t('workingHours.saveSuccess'), 'success');
    onBack();
  };

  return (
    <div className="edit-hours-view" aria-label={t('workingHours.pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* View Header with Back button and Page Title */}
      <header className="edit-hours-header">
        <button
          type="button"
          className="edit-back-btn"
          onClick={onBack}
          aria-label={t('workingHours.backAria')}
        >
          <ArrowLeft size={19} className="edit-back-icon" />
        </button>
        <h1 className="edit-hours-title">{t('workingHours.pageTitle')}</h1>
      </header>

      {/* Scrollable Form Content */}
      <div className="edit-hours-scroll">
        <form onSubmit={handleSubmit} className="edit-hours-form" noValidate>
          {/* Header Info Card */}
          <div className="hours-info-card">
            <div className="hours-info-icon-wrap">
              <Clock size={20} className="hours-clock-icon" />
            </div>
            <div className="hours-info-text">
              <span className="hours-info-title">{t('workingHours.infoCardTitle')}</span>
              <p className="hours-info-desc">{t('workingHours.infoCardDesc')}</p>
            </div>
          </div>

          {/* 7 Days Schedule Cards */}
          <div className="days-list-container" role="group" aria-label={t('workingHours.pageTitle')}>
            {DAYS_ORDER.map((dayKey) => {
              const day = schedule[dayKey];
              const dayName = t(`workingHours.days.${dayKey}`);
              const isOvernight = day.enabled && day.closeTime < day.openTime;
              const formattedClose = formatTime12h(day.closeTime, isArabic);

              return (
                <div
                  key={dayKey}
                  className={`day-card ${day.enabled ? 'enabled' : 'disabled'}`}
                  data-day={dayKey}
                >
                  {/* Day Header Row */}
                  <div className="day-header-row">
                    <div className="day-title-wrap">
                      <span className="day-name">{dayName}</span>
                      <span
                        className={`day-status-badge ${
                          day.enabled ? 'badge-open' : 'badge-closed'
                        }`}
                      >
                        {day.enabled
                          ? t('workingHours.status.open')
                          : t('workingHours.status.closed')}
                      </span>
                    </div>

                    {/* Accessible Day Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={day.enabled}
                      aria-label={t('workingHours.labels.toggleAria', { day: dayName })}
                      className={`day-toggle-switch ${day.enabled ? 'active' : ''}`}
                      onClick={() => handleToggleDay(dayKey)}
                    >
                      <span className="day-toggle-knob" />
                    </button>
                  </div>

                  {/* Day Time Controls */}
                  {day.enabled ? (
                    <div className="day-times-body">
                      <div className="time-fields-grid">
                        {/* Opening Time */}
                        <div className="time-field-col">
                          <label
                            htmlFor={`${dayKey}-open-time`}
                            className="time-field-label"
                          >
                            {t('workingHours.labels.openTime')}
                          </label>
                          <input
                            id={`${dayKey}-open-time`}
                            type="time"
                            className="day-time-input"
                            value={day.openTime}
                            onChange={(e) =>
                              handleTimeChange(dayKey, 'openTime', e.target.value)
                            }
                            required
                          />
                        </div>

                        {/* Closing Time */}
                        <div className="time-field-col">
                          <label
                            htmlFor={`${dayKey}-close-time`}
                            className="time-field-label"
                          >
                            {t('workingHours.labels.closeTime')}
                          </label>
                          <input
                            id={`${dayKey}-close-time`}
                            type="time"
                            className="day-time-input"
                            value={day.closeTime}
                            onChange={(e) =>
                              handleTimeChange(dayKey, 'closeTime', e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Overnight Indicator Badge */}
                      {isOvernight && (
                        <div className="overnight-notice-badge">
                          <Moon size={11} className="moon-icon" />
                          <span>
                            {t('workingHours.status.overnightBadge', {
                              time: formattedClose,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="day-closed-placeholder">
                      <span className="closed-banner-text">
                        {t('workingHours.status.closedAllDay')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Actions */}
          <div className="edit-actions-container">
            <button type="submit" className="btn-save-changes">
              {t('workingHours.actions.save')}
            </button>
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onBack}
            >
              {t('workingHours.actions.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

