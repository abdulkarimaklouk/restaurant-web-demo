import React, { useRef, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle2, Package, Sparkles, LucideIcon } from 'lucide-react';
import { OrderViewTab } from '../../../types/order';
import './OrderTabs.css';

interface OrderTabsProps {
  activeTab: OrderViewTab;
  counts: Record<OrderViewTab, number>;
  onTabChange: (tab: OrderViewTab) => void;
}

interface TabConfig {
  key: OrderViewTab;
  label: string;
  icon: LucideIcon;
}

const tabs: TabConfig[] = [
  { key: 'pending', label: 'بانتظار الدفع', icon: Clock },
  { key: 'new', label: 'طلبات جديدة', icon: Sparkles },
  { key: 'preparing', label: 'قيد التحضير', icon: ChefHat },
  { key: 'ready', label: 'جاهز للاستلام', icon: CheckCircle2 },
  { key: 'delivered', label: 'تم التسليم', icon: Package },
];

export const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  counts,
  onTabChange,
}) => {
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
    <div className="order-tabs-wrapper" role="tablist" aria-label="أقسام الطلبات">
      <div className="order-tabs-scroll">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;

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
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count-badge">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
