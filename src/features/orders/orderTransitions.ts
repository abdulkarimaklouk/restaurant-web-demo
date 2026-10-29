import { Order, PaymentStatus, OperationalStatus } from '../../types/order';

export interface TransitionResult {
  success: boolean;
  order?: Order;
  errorMessage?: string;
}

/**
 * Determines whether an order can advance to the next state, and returns the updated order.
 */
export function advanceOrderStatus(order: Order): TransitionResult {
  // Step 1: If payment is pending confirmation, advance to confirmed (moves to 'newOrder')
  if (order.paymentStatus === 'pendingConfirmation') {
    const updated: Order = {
      ...order,
      paymentStatus: 'confirmed' as PaymentStatus,
      // Operational status stays newOrder
      operationalStatus: 'newOrder' as OperationalStatus,
    };
    return { success: true, order: updated };
  }

  // Guard: If payment is somehow not confirmed, disallow operational progress
  if (order.paymentStatus !== 'confirmed') {
    return {
      success: false,
      errorMessage: 'لا يمكن بدء التحضير قبل تأكيد استلام الدفع.',
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
    errorMessage: 'تم تسليم هذا الطلب بالفعل.',
  };
}

/**
 * Returns the action button label and styling variant for an order card on the dashboard.
 * For pending payment, card displays "مراجعة الإيصال" which opens the review modal.
 */
export function getCardActionInfo(order: Order): {
  label: string;
  variant: 'crimson' | 'primary' | 'green' | 'dark' | 'none';
  disabled: boolean;
  opensModal: boolean;
} {
  if (order.paymentStatus === 'pendingConfirmation') {
    return {
      label: 'مراجعة الإيصال',
      variant: 'crimson',
      disabled: false,
      opensModal: true,
    };
  }

  switch (order.operationalStatus) {
    case 'newOrder':
      return {
        label: 'بدء التحضير',
        variant: 'primary',
        disabled: false,
        opensModal: false,
      };
    case 'preparing':
      return {
        label: 'جاهز للاستلام',
        variant: 'green',
        disabled: false,
        opensModal: false,
      };
    case 'ready':
      return {
        label: 'تسليم الطلب',
        variant: 'dark',
        disabled: false,
        opensModal: false,
      };
    case 'delivered':
      return {
        label: 'تم التسليم',
        variant: 'none',
        disabled: true,
        opensModal: false,
      };
  }
}

/**
 * Returns the primary action button label and styling inside the Order Review Modal.
 * For pending payment, displays "تأكيد الدفع".
 * For already confirmed payment, displays the next operational step.
 */
export function getModalActionInfo(order: Order): {
  label: string;
  variant: 'crimson' | 'primary' | 'green' | 'dark' | 'none';
  disabled: boolean;
} {
  if (order.paymentStatus === 'pendingConfirmation') {
    return {
      label: 'تأكيد الدفع',
      variant: 'crimson',
      disabled: false,
    };
  }

  switch (order.operationalStatus) {
    case 'newOrder':
      return {
        label: 'بدء التحضير',
        variant: 'primary',
        disabled: false,
      };
    case 'preparing':
      return {
        label: 'جاهز للاستلام',
        variant: 'green',
        disabled: false,
      };
    case 'ready':
      return {
        label: 'تسليم الطلب',
        variant: 'dark',
        disabled: false,
      };
    case 'delivered':
      return {
        label: 'تم تسليم الطلب',
        variant: 'none',
        disabled: true,
      };
  }
}

// Backward compatibility alias if needed
export const getOrderActionInfo = getCardActionInfo;
