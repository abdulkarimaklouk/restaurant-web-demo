import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Utensils } from 'lucide-react';
import { TopSellingProduct } from '../types';
import { mapProductToMenuItem } from '../utils/productMappingUtils';
import { MenuProductImage } from '../../menu/components/MenuProductImage';
import './TopSellingItems.css';

interface TopSellingItemsProps {
  products: TopSellingProduct[];
}

export const TopSellingItems: React.FC<TopSellingItemsProps> = ({ products }) => {
  const { t, i18n } = useTranslation('analytics');
  const topThree = products.slice(0, 3);

  return (
    <article
      className="top-selling-card"
      data-testid="top-selling-card"
      aria-labelledby="top-selling-title"
    >
      <div className="top-selling-header">
        <Trophy size={16} strokeWidth={2.2} className="top-selling-icon" aria-hidden="true" />
        <h3 id="top-selling-title" className="top-selling-title">
          {t('performance.topSelling.title')}
        </h3>
      </div>

      <div className="top-selling-list">
        {topThree.length === 0 ? (
          <div className="top-selling-empty" data-testid="top-selling-empty">
            {t('performance.topSelling.empty')}
          </div>
        ) : (
          topThree.map((prod, index) => {
            const mapping = mapProductToMenuItem(prod.displayName, i18n.language);

            return (
              <div
                key={`top-prod-${prod.normalizedName}-${index}`}
                className="top-selling-row"
                data-testid={`top-selling-item-${index}`}
              >
                {/* 1. Thumbnail Image or Neutral Fallback */}
                <div className="top-selling-thumb-wrap">
                  {mapping.isMapped && mapping.imageType ? (
                    <MenuProductImage
                      type={mapping.imageType}
                      name={mapping.displayName}
                      isAvailable={true}
                    />
                  ) : (
                    <div
                      className="top-selling-fallback-thumb"
                      role="img"
                      aria-label={prod.displayName}
                    >
                      <Utensils size={16} strokeWidth={2.2} className="fallback-food-icon" />
                    </div>
                  )}
                </div>

                {/* 2. Product Name and Quantity Sold */}
                <div className="top-selling-info">
                  <span className="top-selling-name" title={mapping.displayName}>
                    {mapping.displayName}
                  </span>
                  <span className="top-selling-sold">
                    {t('performance.topSelling.sold', { count: prod.totalQuantity })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
};

