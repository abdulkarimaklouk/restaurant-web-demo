import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ChefHat, CheckCircle2, Package, Sparkles, LucideIcon } from 'lucide-react';
import { OrderViewTab } from '../../../types/order';
import './OrderTabs.css';

interface OrderTabsProps {
  activeTab: OrderViewTab;
  counts: Record<OrderViewTab, number>;
  onTabChange: (tab: OrderViewTab) => void;
}

interface TabDef {
  key: OrderViewTab;
  icon: LucideIcon;
}

const tabDefs: TabDef[] = [
  { key: 'pending', icon: Clock },
  { key: 'new', icon: Sparkles },
  { key: 'preparing', icon: ChefHat },
  { key: 'ready', icon: CheckCircle2 },
  { key: 'delivered', icon: Package },
];

export const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  counts,
  onTabChange,
}) => {
  const { t } = useTranslation('orders');
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeTab]);

  return (
    <div className="order-tabs-wrapper" role="tablist" aria-label={t('tabs.ariaLabel')}>
      <div className="order-tabs-scroll">
        {tabDefs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;
          const label = t(`tabs.${tab.key}`);

          return (
            <button
              key={tab.key}
              ref={isActive ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`order-tab-item ${tab.key} ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              <Icon size={16} className="tab-icon" />
              <span className="tab-label">{label}</span>
              <span className="tab-count-badge">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
