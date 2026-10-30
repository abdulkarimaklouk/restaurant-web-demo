import React from 'react';
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
}) => {
  return (
    <button
      type="button"
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
  const handleItemClick = (message: string) => {
    onShowToast(message, 'info');
  };

  return (
    <main className="settings-page" aria-label="صفحة الإعدادات">
      {/* Demo Notice Banner */}
      <div className="demo-notice-bar" role="status">
        <Info size={11} className="notice-icon" aria-hidden="true" />
        <span className="notice-text">نسخة عرض تجريبية • واجهة الإعدادات الأولية للمطعم</span>
      </div>

      {/* Main Title Header */}
      <header className="settings-page-header">
        <h1 className="settings-title">الإعدادات</h1>
      </header>

      {/* Settings Scrollable Content */}
      <div className="settings-scroll">
        {/* 1. Restaurant Profile */}
        <section className="settings-section" aria-label="الملف التعريفي للمطعم">
          <button
            type="button"
            className="restaurant-profile-card"
            onClick={() =>
              handleItemClick('الملف التعريفي للمطعم: سيتم تفعيل تعديل البيانات في المرحلة التالية')
            }
            aria-label="الملف التعريفي: مطعم الأطايب، فرع الجامعة الرئيسي"
          >
            <div className="profile-logo-wrap">
              <Store size={22} className="profile-store-icon" />
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <span className="profile-name">مطعم الأطايب</span>
                <span className="verified-badge">موثق</span>
              </div>
              <div className="profile-sub-row">
                <span className="status-dot"></span>
                <span className="profile-status">مفتوح • فرع الحرم الجامعي</span>
              </div>
            </div>
            <div className="profile-action">
              <span className="edit-label">تعديل</span>
              <ChevronLeft size={16} className="settings-chevron" />
            </div>
          </button>
        </section>

        {/* 2. Language */}
        <section className="settings-section" aria-labelledby="section-language">
          <h2 id="section-language" className="settings-section-title">
            <Globe size={13.5} className="section-title-icon" />
            لغة التطبيق
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<span className="lang-code-text">ع</span>}
              iconWrapClassName="lang-icon-wrap"
              title="العربية"
              subtitle="اللغة الافتراضية للواجهة"
              valueTag="الحالية"
              valueTagClassName="active-tag"
              trailing={
                <div className="radio-indicator active" aria-hidden="true">
                  <Check size={12} strokeWidth={2.8} />
                </div>
              }
              onClick={() =>
                handleItemClick('لغة التطبيق (العربية): سيتم تفعيل التبديل في المرحلة التالية')
              }
              ariaLabel="اللغة العربية - نشط حالياً"
              className="lang-option active"
            />
            <SettingsRow
              icon={<span className="lang-code-text">EN</span>}
              iconWrapClassName="lang-icon-wrap"
              title="English"
              subtitle="English interface"
              trailing={<div className="radio-indicator" aria-hidden="true" />}
              onClick={() =>
                handleItemClick('لغة التطبيق (English): سيتم تفعيل التبديل في المرحلة التالية')
              }
              ariaLabel="English - الإنجليزية"
              className="lang-option"
            />
          </div>
        </section>

        {/* 3. Restaurant Settings */}
        <section className="settings-section" aria-labelledby="section-restaurant">
          <h2 id="section-restaurant" className="settings-section-title">
            <Store size={13.5} className="section-title-icon" />
            إعدادات المطعم
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<Clock size={17} strokeWidth={2} />}
              title="أوقات العمل"
              subtitle="مفتوح • 09:00 ص - 11:00 م"
              onClick={() =>
                handleItemClick('أوقات العمل: سيتم تفعيل تعديل المواعيد في المرحلة التالية')
              }
            />
            <SettingsRow
              icon={<Building2 size={17} strokeWidth={2} />}
              title="بيانات المطعم"
              subtitle="العنوان، بيانات التواصل، والترخيص"
              onClick={() =>
                handleItemClick('بيانات المطعم: سيتم تفعيل تحديث البيانات في المرحلة التالية')
              }
            />
            <SettingsRow
              icon={<UtensilsCrossed size={17} strokeWidth={2} />}
              title="إعدادات القائمة"
              subtitle="التصنيفات، التوفر التلقائي، والتسعير"
              onClick={() =>
                handleItemClick('إعدادات القائمة: سيتم تفعيل هذا القسم في المرحلة التالية')
              }
            />
          </div>
        </section>

        {/* 4. App Preferences */}
        <section className="settings-section" aria-labelledby="section-preferences">
          <h2 id="section-preferences" className="settings-section-title">
            <SlidersHorizontal size={13.5} className="section-title-icon" />
            تفضيلات التطبيق
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<Bell size={17} strokeWidth={2} />}
              title="التنبيهات والإشعارات"
              subtitle="إشعارات الطلبات وتأكيدات الدفع"
              valueTag="مفعلة"
              onClick={() =>
                handleItemClick('إعدادات الإشعارات: سيتم تفعيل التخصيص في المرحلة التالية')
              }
            />
            <SettingsRow
              icon={<Palette size={17} strokeWidth={2} />}
              title="المظهر والسمة"
              subtitle="الوضع الفاتح الافتراضي"
              valueTag="فاتح"
              onClick={() =>
                handleItemClick('مظهر التطبيق: سيتم تفعيل تخصيص السمات في المرحلة التالية')
              }
            />
          </div>
        </section>

        {/* 5. Account */}
        <section className="settings-section" aria-labelledby="section-account">
          <h2 id="section-account" className="settings-section-title">
            <Lock size={13.5} className="section-title-icon" />
            الحساب والأمان
          </h2>
          <div className="settings-card">
            <SettingsRow
              icon={<Lock size={17} strokeWidth={2} />}
              title="تغيير كلمة المرور"
              subtitle="تحديث رمز الدخول وكلمة المرور"
              onClick={() =>
                handleItemClick('تغيير كلمة المرور: سيتم تفعيل هذه الميزة في المرحلة التالية')
              }
            />
            <SettingsRow
              icon={<LogOut size={17} strokeWidth={2} />}
              title="تسجيل الخروج"
              subtitle="إنهاء الجلسة الحالية لهذا الجهاز"
              isDanger
              onClick={() =>
                handleItemClick('تسجيل الخروج: سيتم تفعيل تسجيل الخروج في المرحلة التالية')
              }
            />
          </div>
        </section>

        {/* System Version Footer */}
        <footer className="settings-version-footer">
          <span className="version-name">منظومة إدارة مطاعم الحرم الجامعي</span>
          <span className="version-number">الإصدار 1.0.0 • نسخة عرض تجريبية</span>
        </footer>
      </div>
    </main>
  );
};
