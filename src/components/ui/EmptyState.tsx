import React from 'react';
import { PackageOpen } from 'lucide-react';
import { OrderViewTab } from '../../types/order';
import './EmptyState.css';

interface EmptyStateProps {
  tab: OrderViewTab;
}

const emptyStateMessages: Record<OrderViewTab, { title: string; subtitle: string }> = {
  pending: {
    title: 'لا توجد طلبات بانتظار الدفع',
    subtitle: 'ستظهر الطلبات الجديدة المحولة عبر إنستاباي هنا للمراجعة والتأكيد.',
  },
  new: {
    title: 'لا توجد طلبات جديدة',
    subtitle: 'تم تأكيد جميع المدفوعات وبدء تجهيزها في المطبخ.',
  },
  preparing: {
    title: 'لا توجد طلبات قيد التحضير',
    subtitle: 'المطبخ جاهز لاستقبال وتجهيز طلبات الطلاب.',
  },
  ready: {
    title: 'لا توجد طلبات جاهزة',
    subtitle: 'ستظهر هنا الوجبات المكتملة فور تجهيزها لتسليمها للطلاب.',
  },
  delivered: {
    title: 'لا توجد طلبات مكتملة',
    subtitle: 'سجل الطلبات المسلمة فارغ حالياً.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({ tab }) => {
  const { title, subtitle } = emptyStateMessages[tab] || {
    title: 'لا توجد طلبات',
    subtitle: 'لا توجد عناصر لعرضها في هذه القائمة.',
  };

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

