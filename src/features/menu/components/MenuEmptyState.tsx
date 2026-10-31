import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, PackageOpen, RotateCcw, Plus } from 'lucide-react';
import './MenuEmptyState.css';

export interface MenuEmptyStateProps {
  type: 'no-matches' | 'no-items';
  searchQuery?: string;
  onResetFilters?: () => void;
  onClearSearch?: () => void;
  onAddItem?: () => void;
}

export const MenuEmptyState: React.FC<MenuEmptyStateProps> = ({
  type,
  searchQuery,
  onResetFilters,
  onClearSearch,
  onAddItem,
}) => {
  const { t } = useTranslation('menu');

  if (type === 'no-items') {
    return (
      <div className="menu-empty-state" role="status">
        <div className="menu-empty-icon-circle" aria-hidden="true">
          <PackageOpen size={36} className="menu-empty-icon" />
        </div>
        <h3 className="menu-empty-title">{t('emptyMenu.title')}</h3>
        <p className="menu-empty-desc">{t('emptyMenu.desc')}</p>
        {onAddItem && (
          <button
            type="button"
            className="menu-empty-action-btn primary"
            onClick={onAddItem}
          >
            <Plus size={15} />
            <span>{t('emptyMenu.addItemBtn')}</span>
          </button>
        )}
      </div>
    );
  }

  const hasSearch = Boolean(searchQuery && searchQuery.trim());
  const desc = hasSearch
    ? t('emptySearch.descWithQuery', { query: searchQuery?.trim() })
    : t('emptySearch.desc');

  return (
    <div className="menu-empty-state" role="status">
      <div className="menu-empty-icon-circle" aria-hidden="true">
        <SearchX size={36} className="menu-empty-icon" />
      </div>
      <h3 className="menu-empty-title">{t('emptySearch.title')}</h3>
      <p className="menu-empty-desc">{desc}</p>
      <div className="menu-empty-buttons-wrap">
        {onResetFilters && (
          <button
            type="button"
            className="menu-empty-action-btn primary"
            onClick={onResetFilters}
          >
            <RotateCcw size={14} />
            <span>{t('emptySearch.resetBtn')}</span>
          </button>
        )}
        {hasSearch && onClearSearch && (
          <button
            type="button"
            className="menu-empty-action-btn secondary"
            onClick={onClearSearch}
          >
            <span>{t('emptySearch.clearSearchBtn')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

