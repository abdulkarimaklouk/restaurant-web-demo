import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCategoryId, CategoryInfo } from '../../../types/menu';
import './CategoryTabs.css';

interface CategoryTabsProps {
  categories: CategoryInfo[];
  activeCategory: MenuCategoryId;
  onSelectCategory: (category: MenuCategoryId) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation('menu');

  return (
    <nav className="category-tabs-wrapper" aria-label={t('title')}>
      <div className="category-tabs-scroll" role="tablist">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const label = t(cat.labelKey);

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`category-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="category-tab-label">{label}</span>
              <span className="category-count-badge">{cat.count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

