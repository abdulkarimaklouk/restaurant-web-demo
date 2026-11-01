import { useState, useEffect } from 'react';
export const STORAGE_KEY_MENU_ITEMS = 'menu_items';
export const INITIAL_MENU_ITEMS = [
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
export function cloneMenuItems(items) {
    return items.map((item) => ({
        ...item,
        name: { ...item.name },
    }));
}
export function getCategoryCounts(items = INITIAL_MENU_ITEMS) {
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
export function validateMenuItem(raw) {
    if (!raw || typeof raw !== 'object')
        return null;
    const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : null;
    if (!id)
        return null;
    // Name validation: supports { ar: string, en: string } or fallback string
    let name;
    if (raw.name && typeof raw.name === 'object') {
        name = {
            ar: typeof raw.name.ar === 'string' ? raw.name.ar.trim() : '',
            en: typeof raw.name.en === 'string' ? raw.name.en.trim() : '',
        };
    }
    else if (typeof raw.name === 'string' && raw.name.trim()) {
        name = {
            ar: raw.name.trim(),
            en: raw.name.trim(),
        };
    }
    else {
        return null;
    }
    // Must have both Arabic and English names
    if (!name.ar || !name.en)
        return null;
    // Category validation
    const validCategories = ['main', 'appetizers', 'drinks'];
    if (!validCategories.includes(raw.category))
        return null;
    const category = raw.category;
    // Price validation: strictly positive number
    if (typeof raw.price !== 'number' || isNaN(raw.price) || raw.price <= 0) {
        return null;
    }
    const price = raw.price;
    // Currency validation
    const currency = typeof raw.currency === 'string' && raw.currency.trim()
        ? raw.currency.trim()
        : 'EGP';
    // Image type validation
    const validImageTypes = [
        'burger',
        'chicken',
        'pasta',
        'fries',
        'salad',
        'cola',
        'juice',
    ];
    if (!validImageTypes.includes(raw.imageType))
        return null;
    const imageType = raw.imageType;
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
    constructor() {
        this.listeners = new Set();
        this.items = this.readFromStorage();
    }
    readFromStorage() {
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
            if (Array.isArray(parsed)) {
                const validated = [];
                for (const item of parsed) {
                    const validItem = validateMenuItem(item);
                    if (validItem) {
                        validated.push(validItem);
                    }
                }
                if (parsed.length === 0 || validated.length > 0) {
                    return validated;
                }
            }
            console.warn('Invalid or empty menu data in localStorage, restoring defaults');
            const fallback = cloneMenuItems(INITIAL_MENU_ITEMS);
            this.writeToStorage(fallback);
            return fallback;
        }
        catch (e) {
            console.error('Failed to parse menu_items from localStorage:', e);
            const fallback = cloneMenuItems(INITIAL_MENU_ITEMS);
            return fallback;
        }
    }
    writeToStorage(items) {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY_MENU_ITEMS, JSON.stringify(items));
        }
        catch (e) {
            console.error('Failed to persist menu_items to localStorage:', e);
        }
    }
    getItems() {
        return cloneMenuItems(this.items);
    }
    getItemById(id) {
        const item = this.items.find((i) => i.id === id);
        return item ? { ...item, name: { ...item.name } } : undefined;
    }
    generateNextId() {
        const numericIds = this.items
            .map((item) => {
            const match = item.id.match(/^menu-item-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
            .filter((num) => !isNaN(num) && num > 0);
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        let candidate = `menu-item-${maxId + 1}`;
        while (this.items.some((i) => i.id === candidate)) {
            candidate = `menu-item-${Date.now()}`;
        }
        return candidate;
    }
    addItem(input) {
        const id = input.id && input.id.trim() ? input.id.trim() : this.generateNextId();
        if (this.items.some((i) => i.id === id)) {
            console.error(`An item with id "${id}" already exists`);
            return null;
        }
        const candidate = {
            id,
            name: {
                ar: typeof input.name?.ar === 'string' ? input.name.ar.trim() : '',
                en: typeof input.name?.en === 'string' ? input.name.en.trim() : '',
            },
            category: input.category,
            price: typeof input.price === 'number' ? input.price : parseFloat(String(input.price)),
            currency: input.currency && input.currency.trim() ? input.currency.trim() : 'EGP',
            imageType: input.imageType,
            isAvailable: Boolean(input.isAvailable),
        };
        const valid = validateMenuItem(candidate);
        if (!valid) {
            console.error('Failed to validate new menu item:', candidate);
            return null;
        }
        this.items = [...this.items, valid];
        this.writeToStorage(this.items);
        this.notify();
        return valid;
    }
    updateItems(newItems) {
        const validated = [];
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
    updateItem(id, updates) {
        const index = this.items.findIndex((i) => i.id === id);
        if (index === -1) {
            console.warn(`Item with id "${id}" not found`);
            return false;
        }
        const current = this.items[index];
        const candidate = {
            ...current,
            ...updates,
            id: current.id, // Strictly preserve original product ID
            price: updates.price !== undefined
                ? typeof updates.price === 'number'
                    ? updates.price
                    : parseFloat(String(updates.price))
                : current.price,
            name: updates.name !== undefined
                ? typeof updates.name === 'string'
                    ? { ar: updates.name, en: updates.name }
                    : { ...current.name, ...updates.name }
                : current.name,
        };
        const valid = validateMenuItem(candidate);
        if (!valid) {
            console.warn(`Invalid update for item "${id}"`);
            return false;
        }
        this.items[index] = valid;
        this.writeToStorage(this.items);
        this.notify();
        return true;
    }
    deleteItem(id) {
        if (!id || typeof id !== 'string' || !id.trim()) {
            console.warn('Cannot delete item: invalid ID provided');
            return false;
        }
        const trimmedId = id.trim();
        const index = this.items.findIndex((i) => i.id === trimmedId);
        if (index === -1) {
            console.warn(`Item with id "${trimmedId}" not found`);
            return false;
        }
        const nextItems = this.items.filter((i) => i.id !== trimmedId);
        try {
            this.writeToStorage(nextItems);
            this.items = nextItems;
            this.notify();
            return true;
        }
        catch (e) {
            console.error(`Failed to persist menu items after deleting "${trimmedId}":`, e);
            return false;
        }
    }
    resetToDefault() {
        this.items = cloneMenuItems(INITIAL_MENU_ITEMS);
        this.writeToStorage(this.items);
        this.notify();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        this.listeners.forEach((listener) => {
            try {
                listener();
            }
            catch (e) {
                console.error('Error in menuStore listener:', e);
            }
        });
    }
}
export const menuStore = new MenuStore();
export function useMenuStore() {
    const [items, setItems] = useState(() => menuStore.getItems());
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
        getItemById: (id) => menuStore.getItemById(id),
        generateNextId: () => menuStore.generateNextId(),
        addItem: (input) => menuStore.addItem(input),
        updateItems: (newItems) => menuStore.updateItems(newItems),
        updateItem: (id, updates) => menuStore.updateItem(id, updates),
        deleteItem: (id) => menuStore.deleteItem(id),
        resetToDefault: () => menuStore.resetToDefault(),
    };
}
