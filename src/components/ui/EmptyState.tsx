import React from 'react';
import { useTranslation } from 'react-i18next';
import { PackageOpen } from 'lucide-react';
import { OrderViewTab } from '../../types/order';
import './EmptyState.css';

interface EmptyStateProps {
  tab: OrderViewTab;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ tab }) => {
  const { t } = useTranslation('orders');

  const title = t(`empty.${tab}Title`, { defaultValue: t('empty.genericTitle') });
  const subtitle = t(`empty.${tab}Desc`, { defaultValue: t('empty.genericDesc') });

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-circle">
        <PackageOpen size={36} className="empty-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-subtitle">{subtitle}</p>
    </div>
  );
};
