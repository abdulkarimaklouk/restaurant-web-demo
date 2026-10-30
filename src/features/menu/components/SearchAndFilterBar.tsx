import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import './SearchAndFilterBar.css';

interface SearchAndFilterBarProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  onSearchClick,
  onFilterClick,
}) => {
  const { t } = useTranslation('menu');
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchClick();
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
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label={t('searchPlaceholder')}
        />
      </div>

      {/* Filter Button */}
      <button
        type="button"
        className="btn-filter-trigger"
        onClick={onFilterClick}
        aria-label={t('filterAria')}
      >
        <SlidersHorizontal size={17} strokeWidth={2} className="filter-icon" />
      </button>
    </div>
  );
};

