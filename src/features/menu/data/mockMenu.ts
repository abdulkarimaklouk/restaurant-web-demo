import { MenuItem, CategoryInfo } from '../../../types/menu';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-item-1',
    nameKey: 'beefBurger',
    category: 'main',
    price: 120,
    isAvailable: true,
    imageType: 'burger',
  },
  {
    id: 'menu-item-2',
    nameKey: 'grilledChicken',
    category: 'main',
    price: 110,
    isAvailable: true,
    imageType: 'chicken',
  },
  {
    id: 'menu-item-3',
    nameKey: 'pastaAlfredo',
    category: 'main',
    price: 95,
    isAvailable: true,
    imageType: 'pasta',
  },
  {
    id: 'menu-item-4',
    nameKey: 'frenchFries',
    category: 'appetizers',
    price: 40,
    isAvailable: true,
    imageType: 'fries',
  },
  {
    id: 'menu-item-5',
    nameKey: 'caesarSalad',
    category: 'appetizers',
    price: 65,
    isAvailable: false,
    imageType: 'salad',
  },
  {
    id: 'menu-item-6',
    nameKey: 'cocaCola',
    category: 'drinks',
    price: 25,
    isAvailable: true,
    imageType: 'cola',
  },
  {
    id: 'menu-item-7',
    nameKey: 'orangeJuice',
    category: 'drinks',
    price: 30,
    isAvailable: true,
    imageType: 'juice',
  },
];

export function getCategoryCounts(items: MenuItem[] = INITIAL_MENU_ITEMS): CategoryInfo[] {
  const counts = {
    all: items.length,
    main: items.filter((i) => i.category === 'main').length,
    appetizers: items.filter((i) => i.category === 'appetizers').length,
    drinks: items.filter((i) => i.category === 'drinks').length,
  };

  return [
    { id: 'all', labelKey: 'categories.all', count: counts.all },
    { id: 'main', labelKey: 'categories.main', count: counts.main },
    { id: 'appetizers', labelKey: 'categories.appetizers', count: counts.appetizers },
    { id: 'drinks', labelKey: 'categories.drinks', count: counts.drinks },
  ];
}

