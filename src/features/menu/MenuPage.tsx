import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Plus } from 'lucide-react';
import { MenuCategoryId, MenuItem } from '../../types/menu';
import { useMenuStore } from '../../data/menuStore';
import { CategoryTabs } from './components/CategoryTabs';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { MenuProductCard } from './components/MenuProductCard';
import { AddProductScreen } from './components/AddProductScreen';
import { EditProductScreen } from './components/EditProductScreen';
import { ProductActionsSheet } from './components/ProductActionsSheet';
import { DeleteProductDialog } from './components/DeleteProductDialog';
import './MenuPage.css';

interface MenuPageProps {
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onShowToast }) => {
  const { t, i18n } = useTranslation('menu');
  const { items, categoryCounts, deleteItem } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [actionMenuProduct, setActionMenuProduct] = useState<MenuItem | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<MenuItem | null>(null);

  const handleAddItem = () => {
    setIsAddingProduct(true);
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

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleMoreActions = (item: MenuItem) => {
    setActionMenuProduct(item);
  };

  const handleOpenDeleteConfirm = (item: MenuItem) => {
    setActionMenuProduct(null);
    setDeleteConfirmProduct(item);
  };

  const handleConfirmDelete = (item: MenuItem) => {
    if (!item || !item.id) {
      onShowToast(t('deleteProduct.deleteError'), 'warning');
      setDeleteConfirmProduct(null);
      return;
    }

    const currentLang = i18n.resolvedLanguage || i18n.language || 'ar';
    const isEn = currentLang.startsWith('en');
    const productName = item.name
      ? isEn
        ? item.name.en || item.name.ar
        : item.name.ar || item.name.en
      : item.nameKey
        ? t(`items.${item.nameKey}`)
        : '';

    const success = deleteItem(item.id);
    if (success) {
      onShowToast(
        productName
          ? t('deleteProduct.deleteSuccessWithName', { name: productName })
          : t('deleteProduct.deleteSuccess'),
        'success'
      );
    } else {
      onShowToast(t('deleteProduct.deleteError'), 'warning');
    }

    setDeleteConfirmProduct(null);
    setActionMenuProduct(null);
  };

  const handleSelectCategory = (categoryId: MenuCategoryId) => {
    setActiveCategory(categoryId);
  };

  if (isAddingProduct) {
    return (
      <AddProductScreen
        onBack={() => setIsAddingProduct(false)}
        onShowToast={onShowToast}
      />
    );
  }

  if (editingItem) {
    return (
      <EditProductScreen
        key={editingItem.id}
        item={editingItem}
        onBack={() => setEditingItem(null)}
        onShowToast={onShowToast}
      />
    );
  }

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
        categories={categoryCounts}
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
          {items.map((item) => (
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

      {/* 6. Product Actions Bottom Sheet */}
      <ProductActionsSheet
        item={actionMenuProduct}
        isOpen={Boolean(actionMenuProduct)}
        onClose={() => setActionMenuProduct(null)}
        onEdit={(item) => {
          setActionMenuProduct(null);
          setEditingItem(item);
        }}
        onDelete={handleOpenDeleteConfirm}
      />

      {/* 7. Delete Product Confirmation Dialog */}
      <DeleteProductDialog
        item={deleteConfirmProduct}
        isOpen={Boolean(deleteConfirmProduct)}
        onClose={() => setDeleteConfirmProduct(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

