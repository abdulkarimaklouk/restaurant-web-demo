import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  ChevronLeft,
  Globe,
  Check,
  Clock,
  Building2,
  UtensilsCrossed,
  Bell,
  Palette,
  Lock,
  LogOut,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { ToastProps } from '../../components/ui/Toast';
import { useRestaurantProfileStore } from '../../data/restaurantProfileStore';
import { EditRestaurantProfile } from './components/EditRestaurantProfile';
import './SettingsPage.css';

interface SettingsRowProps {
  icon: React.ReactNode;
  iconWrapClassName?: string;
  title: string;
  subtitle?: string;
  valueTag?: string;
  valueTagClassName?: string;
  trailing?: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  isDanger?: boolean;
  role?: string;
  ariaChecked?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconWrapClassName = '',
  title,
  subtitle,
  valueTag,
  valueTagClassName = '',
  trailing,
  onClick,
  ariaLabel,
  className = '',
  isDanger = false,
  role,
  ariaChecked,
}) => {
  return (
    <button
      type="button"
      role={role}
      aria-checked={ariaChecked}
      className={`settings-row-btn ${isDanger ? 'logout-btn' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel || `${title}${subtitle ? ` - ${subtitle}` : ''}`}
    >
      <div className="settings-row-start">
        <div
          className={`settings-icon-wrap ${isDanger ? 'logout-icon-wrap' : ''} ${iconWrapClassName}`.trim()}
        >
          {icon}
        </div>
        <div className="settings-row-text">
          <span className={`settings-row-title ${isDanger ? 'logout-text' : ''}`.trim()}>
            {title}
          </span>
          {subtitle && <span className="settings-row-subtitle">{subtitle}</span>}
        </div>
      </div>
      <div className="settings-row-end">
        {valueTag && (
          <span className={valueTagClassName || 'status-value-text'}>{valueTag}</span>
        )}
        {trailing ?? (
          <ChevronLeft
            size={16}
            className={`settings-chevron ${isDanger ? 'logout-chevron' : ''}`.trim()}
          />
        )}
      </div>
    </button>
  );
};

interface SettingsPageProps {
  onShowToast: (message: string, type?: ToastProps['type']) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onShowToast }) => {
  const { t, i18n } = useTranslation('settings');
  const { profile } = useRestaurantProfileStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleItemClick = (message: string) => {
    onShowToast(message, 'info');
  };

  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  const handleLanguageSelect = (lang: 'ar' | 'en') => {
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar') ? 'ar' : 'en';
    if (currentLang === lang) return;
    i18n.changeLanguage(lang);
  };

  if (isEditingProfile) {
    return (
      <EditRestaurantProfile
        onBack={() => setIsEditingProfile(false)}
        onShowToast={onShowToast}
      />
    );
  }

  const statusPrefix = profile.isOpen ? t('profile.statusOpenPrefix') : t('profile.statusClosedPrefix');

  return (
    <main className="settings-page" aria-label={t('pageTitle')}>
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">{t('demoNotice')}</span>
      </div>

      {/* Main Title Header */}
      <header className="settings-page-header">
        <h1 className="settings-title">{t('pageTitle')}</h1>
      </header>

      {/* Settings Scrollable Content */}
      <div className="settings-scroll">
        {/* 1. Restaurant Profile */}
        <section className="settings-section" aria-label={profile.name}>
          <button
            type="button"
            className="restaurant-profile-card"
            onClick={() => setIsEditingProfile(true)}
            aria-label={`${profile.name} - ${profile.branch}`}
          >
            <div className="profile-logo-wrap">
              <Store size={22} className="profile-store-icon" />
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <span className="profile-name">{profile.name}</span>
                <span className="verified-badge">{t('profile.verified')}</span>
              </div>
              <div className="profile-sub-row">
                <span className={`status-dot ${profile.isOpen ? 'open' : 'closed'}`}></span>
                <span className="profile-status">
                  {statusPrefix} • {profile.branch}
                </span>
              </div>
            </div>
            <div className="profile-action">
              <span className="edit-label">{t('profile.edit')}</span>
              <ChevronLeft size={16} className="settings-chevron" />
            </div>
          </button>
        </section>

        {/* 2. Language */}
        <section className="settings-section" aria-labelledby="section-language">
          <h2 id="section-language" className="settings-section-title">
            <Globe size={13.5} className="section-title-icon" />
            {t('language.sectionTitle')}
          </h2>
          <div className="settings-card" role="radiogroup" aria-label={t('language.sectionTitle')}>
            <SettingsRow
              role="radio"
              ariaChecked={isArabic}
              icon={<span className="lang-code-text">ع</span>}
              iconWrapClassName="lang-icon-wrap"
              title={t('language.arTitle')}
              subtitle={t('language.arSubtitle')}
              valueTag={isArabic ? t('language.currentBadge') : undefined}
              valueTagClassName="active-tag"
              trailing={
                isArabic ? (
                  <div className="radio-indicator active" aria-hidden="true">
                    <Check size={12} strokeWidth={2.8} />
                  </div>
                ) : (
                  <div className="radio-indicator" aria-hidden="true" />
                )
              }
              onClick={() => handleLanguageSelect('ar')}
              ariaLabel={`${t('language.arTitle')}${isArabic ? ` - ${t('language.currentBadge')}` : ''}`}
              className={`lang-option ${isArabic ? 'active' : ''}`}
            />
            <SettingsRow
              role="radio"
              ariaChecked={!isArabic}
              icon={<span className="lang-code-text">EN</span>}
              iconWrapClassName="lang-icon-wrap"
              title={t('language.enTitle')}
              subtitle={t('language.enSubtitle')}
              valueTag={!isArabic ? t('language.currentBadge') : undefined}
              valueTagClassName="active-tag"
              trailing={
                !isArabic ? (
                  <div className="radio-indicator active" aria-hidden="true">
                    <Check size={12} strokeWidth={2.8} />
                  </div>
                ) : (
                  <div className="radio-indicator" aria-hidden="true" />
                )
              }
              onClick={() => handleLanguageSelect('en')}
              ariaLabel={`${t('language.enTitle')}${!isArabic ? ` - ${t('language.currentBadge')}` : ''}`}
              className={`lang-option ${!isArabic ? 'active' : ''}`}
            />
          </div>
        </section>

        {/* 3. Restaurant Settings */}
        <section className="settings-section" aria-labelledby="section-restaurant">
          <h2 id="section-restaurant" className="settings-section-title">
            <Store size={13.5} className="section-title-icon" />
            {t('restaurant.sectionTitle')}
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<Clock size={17} strokeWidth={2} />}
              title={t('restaurant.hoursTitle')}
              subtitle={t('restaurant.hoursSubtitle')}
              onClick={() => handleItemClick(t('toasts.hours'))}
            />
            <SettingsRow
              icon={<Building2 size={17} strokeWidth={2} />}
              title={t('restaurant.infoTitle')}
              subtitle={t('restaurant.infoSubtitle')}
              onClick={() => handleItemClick(t('toasts.info'))}
            />
            <SettingsRow
              icon={<UtensilsCrossed size={17} strokeWidth={2} />}
              title={t('restaurant.menuTitle')}
              subtitle={t('restaurant.menuSubtitle')}
              onClick={() => handleItemClick(t('toasts.menu'))}
            />
          </div>
        </section>

        {/* 4. App Preferences */}
        <section className="settings-section" aria-labelledby="section-preferences">
          <h2 id="section-preferences" className="settings-section-title">
            <SlidersHorizontal size={13.5} className="section-title-icon" />
            {t('preferences.sectionTitle')}
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<Bell size={17} strokeWidth={2} />}
              title={t('preferences.notificationsTitle')}
              subtitle={t('preferences.notificationsSubtitle')}
              valueTag={t('preferences.notificationsBadge')}
              onClick={() => handleItemClick(t('toasts.notifications'))}
            />
            <SettingsRow
              icon={<Palette size={17} strokeWidth={2} />}
              title={t('preferences.appearanceTitle')}
              subtitle={t('preferences.appearanceSubtitle')}
              valueTag={t('preferences.appearanceBadge')}
              onClick={() => handleItemClick(t('toasts.appearance'))}
            />
          </div>
        </section>

        {/* 5. Account */}
        <section className="settings-section" aria-labelledby="section-account">
          <h2 id="section-account" className="settings-section-title">
            <Lock size={13.5} className="section-title-icon" />
            {t('account.sectionTitle')}
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<Lock size={17} strokeWidth={2} />}
              title={t('account.passwordTitle')}
              subtitle={t('account.passwordSubtitle')}
              onClick={() => handleItemClick(t('toasts.password'))}
            />
            <SettingsRow
              icon={<LogOut size={17} strokeWidth={2} />}
              title={t('account.logoutTitle')}
              subtitle={t('account.logoutSubtitle')}
              isDanger
              onClick={() => handleItemClick(t('toasts.logout'))}
            />
          </div>
        </section>

        {/* System Version Footer */}
        <footer className="settings-version-footer">
          <span className="version-name">{t('footer.systemName')}</span>
          <span className="version-number">{t('footer.version')}</span>
        </footer>
      </div>
    </main>
  );
};
