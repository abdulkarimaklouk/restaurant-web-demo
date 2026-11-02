"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuSettingsStore = exports.MenuSettingsStore = exports.STORAGE_KEY_MENU_SETTINGS = void 0;
exports.cloneCategory = cloneCategory;
exports.cloneCategories = cloneCategories;
exports.cloneMenuSettings = cloneMenuSettings;
exports.isValidCategoryIcon = isValidCategoryIcon;
exports.validateCategoryDefinition = validateCategoryDefinition;
exports.useMenuSettingsStore = useMenuSettingsStore;
const react_1 = require("react");
const menuSettings_1 = require("../types/menuSettings");
const menuStore_1 = require("./menuStore");
exports.STORAGE_KEY_MENU_SETTINGS = 'restaurant_menu_settings_v1';
function cloneCategory(category) {
    return {
        ...category,
        name: { ...category.name },
    };
}
function cloneCategories(categories) {
    return categories.map(cloneCategory);
}
function cloneMenuSettings(settings) {
    return {
        categories: cloneCategories(settings.categories),
        autoAvailability: { ...settings.autoAvailability },
        pricing: { ...menuSettings_1.DEFAULT_PRICING_SETTINGS },
    };
}
function isValidCategoryIcon(icon) {
    return typeof icon === 'string' && menuSettings_1.CURATED_CATEGORY_ICONS.includes(icon);
}
function validateCategoryDefinition(raw) {
    if (!raw || typeof raw !== 'object')
        return null;
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    if (!id)
        return null;
    let nameAr = '';
    let nameEn = '';
    if (raw.name && typeof raw.name === 'object') {
        nameAr = typeof raw.name.ar === 'string' ? raw.name.ar.trim() : '';
        nameEn = typeof raw.name.en === 'string' ? raw.name.en.trim() : '';
    }
    if (!nameAr || !nameEn)
        return null;
    if (!isValidCategoryIcon(raw.icon))
        return null;
    const sortOrder = typeof raw.sortOrder === 'number' && !isNaN(raw.sortOrder) ? raw.sortOrder : 0;
    const isDefault = Boolean(raw.isDefault);
    return {
        id,
        name: {
            ar: nameAr,
            en: nameEn,
        },
        icon: raw.icon,
        sortOrder,
        isDefault,
    };
}
class MenuSettingsStore {
    constructor() {
        this.listeners = new Set();
        this.settings = this.readFromStorage();
    }
    readFromStorage() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return cloneMenuSettings(menuSettings_1.DEFAULT_MENU_SETTINGS);
        }
        try {
            const raw = window.localStorage.getItem(exports.STORAGE_KEY_MENU_SETTINGS);
            if (!raw) {
                const initial = cloneMenuSettings(menuSettings_1.DEFAULT_MENU_SETTINGS);
                this.writeToStorage(initial);
                return initial;
            }
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') {
                console.warn('Invalid MenuSettings in localStorage, restoring defaults');
                const fallback = cloneMenuSettings(menuSettings_1.DEFAULT_MENU_SETTINGS);
                this.writeToStorage(fallback);
                return fallback;
            }
            // 1. Validate categories
            const validCategories = [];
            if (Array.isArray(parsed.categories)) {
                for (const cat of parsed.categories) {
                    const validatedCat = validateCategoryDefinition(cat);
                    if (validatedCat && !validCategories.some((c) => c.id === validatedCat.id)) {
                        validCategories.push(validatedCat);
                    }
                }
            }
            // Ensure the three default categories are always present
            for (const defCat of menuSettings_1.DEFAULT_CATEGORY_DEFINITIONS) {
                if (!validCategories.some((c) => c.id === defCat.id)) {
                    validCategories.push(cloneCategory(defCat));
                }
            }
            // Sort categories by sortOrder ascending
            validCategories.sort((a, b) => a.sortOrder - b.sortOrder);
            // 2. Validate autoAvailability
            const autoAvailability = {
                syncWithWorkingHours: Boolean(parsed.autoAvailability?.syncWithWorkingHours),
                dailyAutoReset: Boolean(parsed.autoAvailability?.dailyAutoReset),
                lastResetDate: typeof parsed.autoAvailability?.lastResetDate === 'string'
                    ? parsed.autoAvailability.lastResetDate
                    : undefined,
            };
            // 3. Pricing is strictly fixed to default values
            const pricing = { ...menuSettings_1.DEFAULT_PRICING_SETTINGS };
            const validatedSettings = {
                categories: validCategories,
                autoAvailability,
                pricing,
            };
            return validatedSettings;
        }
        catch (e) {
            console.error('Failed to parse MenuSettings from localStorage:', e);
            const fallback = cloneMenuSettings(menuSettings_1.DEFAULT_MENU_SETTINGS);
            this.writeToStorage(fallback);
            return fallback;
        }
    }
    writeToStorage(settingsToSave) {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        try {
            window.localStorage.setItem(exports.STORAGE_KEY_MENU_SETTINGS, JSON.stringify(settingsToSave));
        }
        catch (e) {
            console.error('Failed to persist MenuSettings to localStorage:', e);
        }
    }
    getSettings() {
        return cloneMenuSettings(this.settings);
    }
    getCategories() {
        return cloneCategories(this.settings.categories).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    getCategoryById(id) {
        const trimmedId = id ? id.trim() : '';
        const cat = this.settings.categories.find((c) => c.id === trimmedId);
        return cat ? cloneCategory(cat) : undefined;
    }
    updateAutoAvailability(updates) {
        this.settings.autoAvailability = {
            ...this.settings.autoAvailability,
            ...updates,
            syncWithWorkingHours: updates.syncWithWorkingHours !== undefined
                ? Boolean(updates.syncWithWorkingHours)
                : this.settings.autoAvailability.syncWithWorkingHours,
            dailyAutoReset: updates.dailyAutoReset !== undefined
                ? Boolean(updates.dailyAutoReset)
                : this.settings.autoAvailability.dailyAutoReset,
            lastResetDate: updates.lastResetDate !== undefined
                ? updates.lastResetDate
                : this.settings.autoAvailability.lastResetDate,
        };
        this.writeToStorage(this.settings);
        this.notify();
    }
    addCategory(input) {
        // 1. Validate Arabic name
        const arName = input.name?.ar ? input.name.ar.trim() : '';
        if (!arName) {
            return { success: false, error: 'Arabic category name is required' };
        }
        // 2. Validate English name
        const enName = input.name?.en ? input.name.en.trim() : '';
        if (!enName) {
            return { success: false, error: 'English category name is required' };
        }
        // 3. Validate icon
        if (!isValidCategoryIcon(input.icon)) {
            return { success: false, error: 'Invalid category icon identifier' };
        }
        // 4. Duplicate name checks (case-insensitive for English, trimmed for Arabic)
        const duplicateAr = this.settings.categories.some((c) => c.name.ar.trim().toLowerCase() === arName.toLowerCase());
        if (duplicateAr) {
            return { success: false, error: 'A category with this Arabic name already exists' };
        }
        const duplicateEn = this.settings.categories.some((c) => c.name.en.trim().toLowerCase() === enName.toLowerCase());
        if (duplicateEn) {
            return { success: false, error: 'A category with this English name already exists' };
        }
        // 5. Generate stable unique ID
        let candidateId = input.id && input.id.trim() ? input.id.trim().toLowerCase() : '';
        if (!candidateId || this.settings.categories.some((c) => c.id === candidateId)) {
            const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const baseId = slug ? `cat-${slug}` : `cat-${Date.now()}`;
            candidateId = baseId;
            let counter = 1;
            while (this.settings.categories.some((c) => c.id === candidateId)) {
                candidateId = `${baseId}-${counter++}`;
            }
        }
        // 6. Assign next available sortOrder
        const maxSortOrder = this.settings.categories.length > 0
            ? Math.max(...this.settings.categories.map((c) => c.sortOrder))
            : -1;
        const sortOrder = typeof input.sortOrder === 'number' && !isNaN(input.sortOrder)
            ? input.sortOrder
            : maxSortOrder + 1;
        const newCategory = {
            id: candidateId,
            name: {
                ar: arName,
                en: enName,
            },
            icon: input.icon,
            sortOrder,
            isDefault: false,
        };
        this.settings.categories.push(newCategory);
        this.writeToStorage(this.settings);
        this.notify();
        return {
            success: true,
            category: cloneCategory(newCategory),
        };
    }
    updateCategory(id, updates) {
        const trimmedId = id ? id.trim() : '';
        const index = this.settings.categories.findIndex((c) => c.id === trimmedId);
        if (index === -1) {
            return { success: false, error: `Category "${trimmedId}" not found` };
        }
        const current = this.settings.categories[index];
        // 1. Validate Arabic name if provided
        let nextAr = current.name.ar;
        if (updates.name && updates.name.ar !== undefined) {
            const trimmed = updates.name.ar.trim();
            if (!trimmed) {
                return { success: false, error: 'Arabic category name cannot be empty' };
            }
            // Check duplicate Arabic name against other categories
            const duplicateAr = this.settings.categories.some((c) => c.id !== trimmedId && c.name.ar.trim().toLowerCase() === trimmed.toLowerCase());
            if (duplicateAr) {
                return { success: false, error: 'A category with this Arabic name already exists' };
            }
            nextAr = trimmed;
        }
        // 2. Validate English name if provided
        let nextEn = current.name.en;
        if (updates.name && updates.name.en !== undefined) {
            const trimmed = updates.name.en.trim();
            if (!trimmed) {
                return { success: false, error: 'English category name cannot be empty' };
            }
            // Check duplicate English name against other categories
            const duplicateEn = this.settings.categories.some((c) => c.id !== trimmedId && c.name.en.trim().toLowerCase() === trimmed.toLowerCase());
            if (duplicateEn) {
                return { success: false, error: 'A category with this English name already exists' };
            }
            nextEn = trimmed;
        }
        // 3. Validate icon if provided
        let nextIcon = current.icon;
        if (updates.icon !== undefined) {
            if (!isValidCategoryIcon(updates.icon)) {
                return { success: false, error: 'Invalid category icon identifier' };
            }
            nextIcon = updates.icon;
        }
        // 4. SortOrder if provided
        const nextSortOrder = typeof updates.sortOrder === 'number' && !isNaN(updates.sortOrder)
            ? updates.sortOrder
            : current.sortOrder;
        const updatedCategory = {
            id: current.id, // Strictly preserve original category ID
            name: {
                ar: nextAr,
                en: nextEn,
            },
            icon: nextIcon,
            sortOrder: nextSortOrder,
            isDefault: current.isDefault, // Strictly preserve default protection
        };
        this.settings.categories[index] = updatedCategory;
        this.writeToStorage(this.settings);
        this.notify();
        return {
            success: true,
            category: cloneCategory(updatedCategory),
        };
    }
    isCategoryInUse(categoryId) {
        try {
            const items = menuStore_1.menuStore.getItems();
            return items.some((item) => item.category === categoryId);
        }
        catch {
            return false;
        }
    }
    deleteCategory(id, productInUseChecker) {
        const trimmedId = id ? id.trim() : '';
        const index = this.settings.categories.findIndex((c) => c.id === trimmedId);
        if (index === -1) {
            return { success: false, error: `Category "${trimmedId}" not found` };
        }
        const category = this.settings.categories[index];
        // 1. Protect default categories
        if (category.isDefault || ['main', 'appetizers', 'drinks'].includes(trimmedId)) {
            return { success: false, error: 'Default categories cannot be deleted' };
        }
        // 2. Check if category contains active products
        const inUse = productInUseChecker
            ? productInUseChecker(trimmedId)
            : this.isCategoryInUse(trimmedId);
        if (inUse) {
            return {
                success: false,
                error: 'Cannot delete category containing products. Reassign or delete products first.',
            };
        }
        const deleted = this.settings.categories.splice(index, 1)[0];
        this.writeToStorage(this.settings);
        this.notify();
        return {
            success: true,
            category: cloneCategory(deleted),
        };
    }
    reorderCategories(orderedIds) {
        if (!Array.isArray(orderedIds)) {
            return { success: false, error: 'Ordered IDs must be an array' };
        }
        if (orderedIds.length !== this.settings.categories.length) {
            return {
                success: false,
                error: `Expected ${this.settings.categories.length} category IDs, got ${orderedIds.length}`,
            };
        }
        const currentIds = new Set(this.settings.categories.map((c) => c.id));
        const uniqueInputIds = new Set(orderedIds);
        if (uniqueInputIds.size !== orderedIds.length) {
            return { success: false, error: 'Duplicate category IDs in reorder array' };
        }
        for (const id of orderedIds) {
            if (!currentIds.has(id)) {
                return { success: false, error: `Category ID "${id}" does not exist` };
            }
        }
        const catMap = new Map(this.settings.categories.map((c) => [c.id, c]));
        const reordered = orderedIds.map((id, index) => {
            const cat = catMap.get(id);
            return {
                ...cat,
                sortOrder: index,
            };
        });
        this.settings.categories = reordered;
        this.writeToStorage(this.settings);
        this.notify();
        return { success: true };
    }
    checkAndExecuteDailyReset(currentDate = new Date()) {
        const settings = this.getSettings();
        if (!settings.autoAvailability.dailyAutoReset) {
            return false;
        }
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;
        if (settings.autoAvailability.lastResetDate === todayStr) {
            return false;
        }
        // New business day detected: restore unavailable items
        try {
            const items = menuStore_1.menuStore.getItems();
            const hasUnavailable = items.some((item) => !item.isAvailable);
            if (hasUnavailable) {
                const restored = items.map((item) => ({ ...item, isAvailable: true }));
                menuStore_1.menuStore.updateItems(restored);
            }
        }
        catch (e) {
            console.error('Failed to restore menu availability during daily reset:', e);
        }
        this.updateAutoAvailability({ lastResetDate: todayStr });
        return true;
    }
    resetToDefault() {
        this.settings = cloneMenuSettings(menuSettings_1.DEFAULT_MENU_SETTINGS);
        this.writeToStorage(this.settings);
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
                console.error('Error in menuSettingsStore listener:', e);
            }
        });
    }
}
exports.MenuSettingsStore = MenuSettingsStore;
exports.menuSettingsStore = new MenuSettingsStore();
function useMenuSettingsStore() {
    const [settings, setSettings] = (0, react_1.useState)(() => exports.menuSettingsStore.getSettings());
    (0, react_1.useEffect)(() => {
        const unsubscribe = exports.menuSettingsStore.subscribe(() => {
            setSettings(exports.menuSettingsStore.getSettings());
        });
        return unsubscribe;
    }, []);
    return {
        settings,
        categories: settings.categories,
        autoAvailability: settings.autoAvailability,
        pricing: settings.pricing,
        getCategoryById: (id) => exports.menuSettingsStore.getCategoryById(id),
        updateAutoAvailability: (updates) => exports.menuSettingsStore.updateAutoAvailability(updates),
        addCategory: (input) => exports.menuSettingsStore.addCategory(input),
        updateCategory: (id, updates) => exports.menuSettingsStore.updateCategory(id, updates),
        deleteCategory: (id, productInUseChecker) => exports.menuSettingsStore.deleteCategory(id, productInUseChecker),
        reorderCategories: (orderedIds) => exports.menuSettingsStore.reorderCategories(orderedIds),
        resetToDefault: () => exports.menuSettingsStore.resetToDefault(),
        checkAndExecuteDailyReset: (d) => exports.menuSettingsStore.checkAndExecuteDailyReset(d),
    };
}
