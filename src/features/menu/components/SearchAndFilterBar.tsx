import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './SearchAndFilterBar.css';

interface SearchAndFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchClick?: () => void;
  onFilterClick: () => void;
  isFilterActive?: boolean;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  onSearchClick,
  onFilterClick,
  isFilterActive = false,
}) => {
  const { t } = useTranslation('menu');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (onSearchChange) onSearchChange('');
    } else if (e.key === 'Enter') {
      if (onSearchClick) onSearchClick();
    }
  };

  return (
    <div className="search-filter-container">
      {/* Search Input Box */}
      <div className="search-input-box" onClick={onSearchClick}>
        <Search size={16} className="search-field-icon" aria-hidden="true" />
        <input
          type="text"
          className="search-field-input"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label={t('searchPlaceholder')}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label={t('clearSearch', { defaultValue: 'Clear search' })}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        type="button"
        className={`btn-filter-trigger ${isFilterActive ? 'active' : ''}`}
        onClick={onFilterClick}
        aria-label={t('filterAria')}
      >
        <SlidersHorizontal size={17} strokeWidth={2} className="filter-icon" />
        {isFilterActive && <span className="filter-active-dot" aria-hidden="true" />}
      </button>
    </div>
  );
};
