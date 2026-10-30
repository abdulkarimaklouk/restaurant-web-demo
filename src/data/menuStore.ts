import { useState, useEffect } from 'react';
import {
  MenuItem,
  CategoryInfo,
  MenuCategoryType,
  MenuProductImageType,
  LocalizedName,
} from '../types/menu';

export const STORAGE_KEY_MENU_ITEMS = 'menu_items';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-item-1',
    name: {
      ar: 'برجر لحم',
      en: 'Beef Burger',
    },
    category: 'main',
    price: 120,
    currency: 'EGP',
    imageType: 'burger',
    isAvailable: true,
  },
  {
    id: 'menu-item-2',
    name: {
      ar: 'دجاج مشوي',
      en: 'Grilled Chicken',
    },
    category: 'main',
    price: 110,
    currency: 'EGP',
    imageType: 'chicken',
    isAvailable: true,
  },
  {
    id: 'menu-item-3',
    name: {
      ar: 'باستا ألفريدو',
      en: 'Pasta Alfredo',
    },
    category: 'main',
    price: 95,
    currency: 'EGP',
    imageType: 'pasta',
    isAvailable: true,
  },
  {
    id: 'menu-item-4',
    name: {
      ar: 'بطاطس مقلية',
      en: 'French Fries',
    },
    category: 'appetizers',
    price: 40,
    currency: 'EGP',
    imageType: 'fries',
    isAvailable: true,
  },
  {
    id: 'menu-item-5',
    name: {
      ar: 'سلطة سيزر',
      en: 'Caesar Salad',
    },
    category: 'appetizers',
    price: 65,
    currency: 'EGP',
    imageType: 'salad',
    isAvailable: false,
  },
  {
    id: 'menu-item-6',
    name: {
      ar: 'كوكاكولا',
      en: 'Coca Cola',
    },
    category: 'drinks',
    price: 25,
    currency: 'EGP',
    imageType: 'cola',
    isAvailable: true,
  },
  {
    id: 'menu-item-7',
    name: {
      ar: 'عصير برتقال',
      en: 'Orange Juice',
    },
    category: 'drinks',
    price: 30,
    currency: 'EGP',
    imageType: 'juice',
    isAvailable: true,
  },
];

export function cloneMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    name: { ...item.name },
  }));
}

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

export function validateMenuItem(raw: any): MenuItem | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : null;
  if (!id) return null;

  // Name validation: supports { ar: string, en: string } or fallback string
  let name: LocalizedName;
  if (raw.name && typeof raw.name === 'object') {
    name = {
      ar: typeof raw.name.ar === 'string' ? raw.name.ar.trim() : '',
      en: typeof raw.name.en === 'string' ? raw.name.en.trim() : '',
    };
  } else if (typeof raw.name === 'string' && raw.name.trim()) {
    name = {
      ar: raw.name.trim(),
      en: raw.name.trim(),
    };
  } else {
    return null;
  }

  // Must have at least one name representation
  if (!name.ar && !name.en) return null;

  // Category validation
  const validCategories: MenuCategoryType[] = ['main', 'appetizers', 'drinks'];
  const category: MenuCategoryType = validCategories.includes(raw.category)
    ? raw.category
    : 'main';

  // Price validation
  const price =
    typeof raw.price === 'number' && !isNaN(raw.price) && raw.price >= 0
      ? raw.price
      : 0;

  // Currency validation
  const currency =
    typeof raw.currency === 'string' && raw.currency.trim()
      ? raw.currency.trim()
      : 'EGP';

  // Image type validation
  const validImageTypes: MenuProductImageType[] = [
    'burger',
    'chicken',
    'pasta',
    'fries',
    'salad',
    'cola',
    'juice',
  ];
  const imageType: MenuProductImageType = validImageTypes.includes(raw.imageType)
    ? raw.imageType
    : 'burger';

  // Availability validation
  const isAvailable = Boolean(raw.isAvailable);

  return {
    id,
    name,
    category,
    price,
    currency,
    imageType,
    isAvailable,
    nameKey: typeof raw.nameKey === 'string' ? raw.nameKey : undefined,
  };
}

class MenuStore {
  private items: MenuItem[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.items = this.readFromStorage();
  }

  private readFromStorage(): MenuItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return cloneMenuItems(INITIAL_MENU_ITEMS);
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_MENU_ITEMS);

      // First launch: initialize with INITIAL_MENU_ITEMS and persist immediately
      if (!raw) {
        const seeded = cloneMenuItems(INITIAL_MENU_ITEMS);
        this.writeToStorage(seeded);
        return seeded;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: MenuItem[] = [];
        for (const item of parsed) {
          const validItem = validateMenuItem(item);
          if (validItem) {
            validated.push(validItem);
          }
        }

        if (validated.length > 0) {
          return validated;
        }
      }

      console.warn('Invalid or empty menu data in localStorage, restoring defaults');
      const fallback = cloneMenuItems(INITIAL_MENU_ITEMS);
      this.writeToStorage(fallback);
      return fallback;
    } catch (e) {
      console.error('Failed to parse menu_items from localStorage:', e);
      const fallback = cloneMenuItems(INITIAL_MENU_ITEMS);
      return fallback;
    }
  }

  private writeToStorage(items: MenuItem[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_MENU_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist menu_items to localStorage:', e);
    }
  }

  public getItems(): MenuItem[] {
    return cloneMenuItems(this.items);
  }

  public getItemById(id: string): MenuItem | undefined {
    const item = this.items.find((i) => i.id === id);
    return item ? { ...item, name: { ...item.name } } : undefined;
  }

  public updateItems(newItems: MenuItem[]): void {
    const validated: MenuItem[] = [];
    for (const item of newItems) {
      const valid = validateMenuItem(item);
      if (valid) {
        validated.push(valid);
      }
    }

    if (validated.length === 0) {
      console.warn('Cannot update menu items with empty or invalid list');
      return;
    }

    this.items = validated;
    this.writeToStorage(this.items);
    this.notify();
  }

  public updateItem(id: string, updates: Partial<MenuItem>): void {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      console.warn(`Item with id "${id}" not found`);
      return;
    }

    const current = this.items[index];
    const candidate = {
      ...current,
      ...updates,
      name:
        updates.name !== undefined
          ? typeof updates.name === 'string'
            ? { ar: updates.name, en: updates.name }
            : { ...current.name, ...updates.name }
          : current.name,
    };

    const valid = validateMenuItem(candidate);
    if (!valid) {
      console.warn(`Invalid update for item "${id}"`);
      return;
    }

    this.items[index] = valid;
    this.writeToStorage(this.items);
    this.notify();
  }

  public resetToDefault(): void {
    this.items = cloneMenuItems(INITIAL_MENU_ITEMS);
    this.writeToStorage(this.items);
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in menuStore listener:', e);
      }
    });
  }
}

export const menuStore = new MenuStore();

export function useMenuStore() {
  const [items, setItems] = useState<MenuItem[]>(() => menuStore.getItems());

  useEffect(() => {
    const unsubscribe = menuStore.subscribe(() => {
      setItems(menuStore.getItems());
    });
    return unsubscribe;
  }, []);

  const categoryCounts = getCategoryCounts(items);

  return {
    items,
    categoryCounts,
    getItemById: (id: string) => menuStore.getItemById(id),
    updateItems: (newItems: MenuItem[]) => menuStore.updateItems(newItems),
    updateItem: (id: string, updates: Partial<MenuItem>) => menuStore.updateItem(id, updates),
    resetToDefault: () => menuStore.resetToDefault(),
  };
}

