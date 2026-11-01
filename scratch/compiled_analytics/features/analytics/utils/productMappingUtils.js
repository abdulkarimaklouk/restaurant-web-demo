import { INITIAL_MENU_ITEMS } from '../../../data/menuStore.js';
import { normalizeProductName } from './analyticsCalculations.js';
/**
 * Attempts to map an OrderItem product name to a verified MenuItem record.
 * Strictly uses exact normalized string matching.
 * If no verified match exists, preserves the original order item name without guessing.
 */
export function mapProductToMenuItem(rawName, lng = 'ar') {
    const norm = normalizeProductName(rawName);
    const isEn = lng.startsWith('en');
    if (!norm) {
        return {
            isMapped: false,
            menuItem: null,
            imageType: null,
            displayName: rawName,
        };
    }
    // Look for exact match in verified menu catalog
    for (const item of INITIAL_MENU_ITEMS) {
        const normAr = normalizeProductName(item.name.ar);
        const normEn = normalizeProductName(item.name.en);
        if (norm === normAr || norm === normEn) {
            return {
                isMapped: true,
                menuItem: item,
                imageType: item.imageType,
                displayName: isEn ? item.name.en : item.name.ar,
            };
        }
    }
    // No verified mapping exists -> preserve original name safely
    return {
        isMapped: false,
        menuItem: null,
        imageType: null,
        displayName: rawName,
    };
}
