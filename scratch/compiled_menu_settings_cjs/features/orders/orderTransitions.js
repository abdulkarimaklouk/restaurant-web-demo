"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderActionInfo = void 0;
exports.advanceOrderStatus = advanceOrderStatus;
exports.getCardActionInfo = getCardActionInfo;
exports.getModalActionInfo = getModalActionInfo;
const i18n_1 = require("../../i18n");
/**
 * Determines whether an order can advance to the next state, and returns the updated order.
 */
function advanceOrderStatus(order, translate) {
    const t = translate || ((key) => i18n_1.default.t(key));
    // Step 1: If payment is pending confirmation, advance to confirmed (moves to 'newOrder')
    if (order.paymentStatus === 'pendingConfirmation') {
        const updated = {
            ...order,
            paymentStatus: 'confirmed',
            operationalStatus: 'newOrder',
        };
        return { success: true, order: updated };
    }
    // Guard: If payment is not confirmed, disallow operational progress
    if (order.paymentStatus !== 'confirmed') {
        return {
            success: false,
            errorMessage: t('orders:toasts.cannotPrepare'),
        };
    }
    // Step 2: newOrder -> preparing
    if (order.operationalStatus === 'newOrder') {
        const updated = {
            ...order,
            operationalStatus: 'preparing',
        };
        return { success: true, order: updated };
    }
    // Step 3: preparing -> ready
    if (order.operationalStatus === 'preparing') {
        const updated = {
            ...order,
            operationalStatus: 'ready',
        };
        return { success: true, order: updated };
    }
    // Step 4: ready -> delivered
    if (order.operationalStatus === 'ready') {
        const updated = {
            ...order,
            operationalStatus: 'delivered',
        };
        return { success: true, order: updated };
    }
    // Already delivered
    return {
        success: false,
        errorMessage: t('orders:toasts.alreadyDelivered'),
    };
}
/**
 * Returns the action button label and styling variant for an order card on the dashboard.
 */
function getCardActionInfo(order, translate) {
    const t = translate || ((key) => i18n_1.default.t(key));
    if (order.paymentStatus === 'pendingConfirmation') {
        return {
            label: t('orders:card.actions.reviewReceipt'),
            variant: 'crimson',
            disabled: false,
            opensModal: true,
        };
    }
    switch (order.operationalStatus) {
        case 'newOrder':
            return {
                label: t('orders:card.actions.startPreparing'),
                variant: 'primary',
                disabled: false,
                opensModal: false,
            };
        case 'preparing':
            return {
                label: t('orders:card.actions.markReady'),
                variant: 'green',
                disabled: false,
                opensModal: false,
            };
        case 'ready':
            return {
                label: t('orders:card.actions.markDelivered'),
                variant: 'dark',
                disabled: false,
                opensModal: false,
            };
        case 'delivered':
            return {
                label: t('orders:card.actions.delivered'),
                variant: 'none',
                disabled: true,
                opensModal: false,
            };
    }
}
/**
 * Returns the primary action button label and styling inside the Order Review Modal.
 */
function getModalActionInfo(order, translate) {
    const t = translate || ((key) => i18n_1.default.t(key));
    if (order.paymentStatus === 'pendingConfirmation') {
        return {
            label: t('orders:modal.confirmPayment'),
            variant: 'crimson',
            disabled: false,
        };
    }
    switch (order.operationalStatus) {
        case 'newOrder':
            return {
                label: t('orders:card.actions.startPreparing'),
                variant: 'primary',
                disabled: false,
            };
        case 'preparing':
            return {
                label: t('orders:card.actions.markReady'),
                variant: 'green',
                disabled: false,
            };
        case 'ready':
            return {
                label: t('orders:card.actions.markDelivered'),
                variant: 'dark',
                disabled: false,
            };
        case 'delivered':
            return {
                label: t('orders:card.actions.delivered'),
                variant: 'none',
                disabled: true,
            };
    }
}
// Backward compatibility alias
exports.getOrderActionInfo = getCardActionInfo;
