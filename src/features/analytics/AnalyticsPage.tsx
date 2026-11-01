import React, { useState, useMemo } from 'react';
import { useOrderStore } from '../../data/mockStore';
import { AnalyticsDatePreset } from './types';
import { generateAnalyticsDataSet } from './utils/analyticsCalculations';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { KpiCardGrid } from './components/KpiCardGrid';
import { CustomDateRangeModal, formatIsoDateString } from './components/CustomDateRangeModal';
import './AnalyticsPage.css';

interface AnalyticsPageProps {
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = () => {
  const { orders } = useOrderStore();
  const [preset, setPreset] = useState<AnalyticsDatePreset>('today');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Default custom range: start of today to end of today
  const todayStr = useMemo(() => formatIsoDateString(new Date()), []);
  const [customStart, setCustomStart] = useState<string>(todayStr);
  const [customEnd, setCustomEnd] = useState<string>(todayStr);

  const handleSelectPreset = (newPreset: AnalyticsDatePreset) => {
    setPreset(newPreset);
  };

  const handleApplyCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setPreset('custom');
  };

  const customRangeLabel = useMemo(() => {
    if (preset !== 'custom' || !customStart || !customEnd) return undefined;
    return `${customStart} - ${customEnd}`;
  }, [preset, customStart, customEnd]);

  // Compute reactive dataset using the Phase 2 calculations engine
  const dataSet = useMemo(() => {
    const customStartDate =
      preset === 'custom' && customStart ? new Date(customStart) : null;
    const customEndDate =
      preset === 'custom' && customEnd ? new Date(customEnd) : null;

    return generateAnalyticsDataSet(
      orders,
      preset,
      Date.now(),
      customStartDate,
      customEndDate
    );
  }, [orders, preset, customStart, customEnd]);

  return (
    <main className="analytics-page" data-testid="analytics-page">
      <div className="analytics-scroll-content">
        {/* Header with Title and Date Presets */}
        <AnalyticsHeader
          activePreset={preset}
          onSelectPreset={handleSelectPreset}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
          customRangeLabel={customRangeLabel}
        />

        {/* 2x2 KPI Cards Grid */}
        <KpiCardGrid kpis={dataSet.kpis} preset={preset} />

        {/* Reserved space for future sections (Sales chart, Top items, Statuses, Insights) */}
        <div className="analytics-future-sections" aria-hidden="true" />
      </div>

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={handleApplyCustomRange}
        initialStartDate={customStart}
        initialEndDate={customEnd}
      />
    </main>
  );
};

