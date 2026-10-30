import { Order, PaymentStatus, OperationalStatus } from '../../types/order';
import i18n from '../../i18n';

export interface TransitionResult {
  success: boolean;
  order?: Order;
  errorMessage?: string;
}

/**
 * Determines whether an order can advance to the next state, and returns the updated order.
 */
export function advanceOrderStatus(
  order: Order,
  translate?: (key: string) => string
): TransitionResult {
  const t = translate || ((key: string) => i18n.t(key));

  // Step 1: If payment is pending confirmation, advance to confirmed (moves to 'newOrder')
  if (order.paymentStatus === 'pendingConfirmation') {
    const updated: Order = {
      ...order,
      paymentStatus: 'confirmed' as PaymentStatus,
      operationalStatus: 'newOrder' as OperationalStatus,
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
    const updated: Order = {
      ...order,
      operationalStatus: 'preparing' as OperationalStatus,
    };
    return { success: true, order: updated };
  }

  // Step 3: preparing -> ready
  if (order.operationalStatus === 'preparing') {
    const updated: Order = {
      ...order,
      operationalStatus: 'ready' as OperationalStatus,
    };
    return { success: true, order: updated };
  }

  // Step 4: ready -> delivered
  if (order.operationalStatus === 'ready') {
    const updated: Order = {
      ...order,
      operationalStatus: 'delivered' as OperationalStatus,
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
export function getCardActionInfo(
  order: Order,
  translate?: (key: string) => string
): {
  label: string;
  variant: 'crimson' | 'primary' | 'green' | 'dark' | 'none';
  disabled: boolean;
  opensModal: boolean;
} {
  const t = translate || ((key: string) => i18n.t(key));

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
export function getModalActionInfo(
  order: Order,
  translate?: (key: string) => string
): {
  label: string;
  variant: 'crimson' | 'primary' | 'green' | 'dark' | 'none';
  disabled: boolean;
} {
  const t = translate || ((key: string) => i18n.t(key));

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
export const getOrderActionInfo = getCardActionInfo;
