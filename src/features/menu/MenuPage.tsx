import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Plus } from 'lucide-react';
import { MenuCategoryId, MenuItem } from '../../types/menu';
import { INITIAL_MENU_ITEMS, getCategoryCounts } from './data/mockMenu';
import { CategoryTabs } from './components/CategoryTabs';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { MenuProductCard } from './components/MenuProductCard';
import './MenuPage.css';

interface MenuPageProps {
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onShowToast }) => {
  const { t } = useTranslation('menu');
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>('all');
  const categories = getCategoryCounts(INITIAL_MENU_ITEMS);

  const handleAddItem = () => {
    onShowToast(t('toasts.addItemNotice'), 'info');
  };

  const handleSearchClick = () => {
    onShowToast(t('toasts.searchNotice'), 'info');
  };

  const handleFilterClick = () => {
    onShowToast(t('toasts.filterNotice'), 'info');
  };

  const handleToggleAvailability = (_item: MenuItem) => {
    onShowToast(t('toasts.toggleNotice'), 'info');
  };

  const handleEditItem = (_item: MenuItem) => {
    onShowToast(t('toasts.editNotice'), 'info');
  };

  const handleMoreActions = (_item: MenuItem) => {
    onShowToast(t('toasts.moreNotice'), 'info');
  };

  const handleSelectCategory = (categoryId: MenuCategoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <div className="menu-page">
      {/* 1. Subtle Demo Notice Banner per WEB_DEMO_SPEC */}
      <aside className="demo-notice-bar" aria-label={t('demoNotice')}>
        <Info size={14} className="notice-icon" />
        <span className="notice-text">{t('demoNotice')}</span>
      </aside>

      {/* 2. Page Header with Title and Primary Add Item Button */}
      <header className="menu-page-header">
        <h1 className="menu-page-title">{t('title')}</h1>
        <button
          type="button"
          className="btn-add-item"
          onClick={handleAddItem}
          aria-label={t('addItem')}
        >
          <Plus size={15} strokeWidth={2.6} className="add-item-icon" />
          <span className="add-item-label">{t('addItem')}</span>
        </button>
      </header>

      {/* 3. Category Navigation Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 4. Search and Filter Bar */}
      <SearchAndFilterBar
        onSearchClick={handleSearchClick}
        onFilterClick={handleFilterClick}
      />

      {/* 5. Scrollable Menu Products List */}
      <main className="menu-list-scroll">
        <div className="menu-cards-container">
          {INITIAL_MENU_ITEMS.map((item) => (
            <MenuProductCard
              key={item.id}
              item={item}
              onToggleAvailability={handleToggleAvailability}
              onEditItem={handleEditItem}
              onMoreActions={handleMoreActions}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

