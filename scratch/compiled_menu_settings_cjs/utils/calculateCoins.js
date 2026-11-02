"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCoins = calculateCoins;
/**
 * Display-only rule per WEB_DEMO_SPEC.md: floor(total / 10)
 */
function calculateCoins(total) {
    return Math.floor(total / 10);
}
