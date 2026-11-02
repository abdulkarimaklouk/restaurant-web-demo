import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';
import { MenuCategoryId, CategoryInfo } from '../../../types/menu';
import { renderCategoryIcon } from '../../../components/ui/CategoryIcon';
import { CategoryIconType } from '../../../types/menuSettings';
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
  const { t, i18n } = useTranslation('menu');
  const isArabic = (i18n.resolvedLanguage || i18n.language || 'ar').startsWith('ar');

  const getCategoryIcon = (cat: CategoryInfo) => {
    if (cat.id === 'all') {
      return <LayoutGrid size={15} strokeWidth={2.2} className="category-tab-icon" />;
    }
    const iconName =
      cat.icon ||
      (cat.id === 'main'
        ? 'utensils'
        : cat.id === 'appetizers'
        ? 'salad'
        : cat.id === 'drinks'
        ? 'cup-soda'
        : 'layout-grid');
    return renderCategoryIcon(iconName as CategoryIconType, 15, 'category-tab-icon');
  };

  return (
    <nav className="category-tabs-wrapper" aria-label={t('title')}>
      <div className="category-tabs-scroll" role="tablist">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const label =
            cat.id === 'all'
              ? t('categories.all')
              : cat.name
              ? isArabic
                ? cat.name.ar
                : cat.name.en
              : cat.labelKey
              ? t(cat.labelKey)
              : cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`category-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              {getCategoryIcon(cat)}
              <span className="category-tab-label">{label}</span>
              <span className="category-count-badge">{cat.count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
