import { useState, useEffect } from 'react';
import { Order, OrderViewTab } from '../types/order';
import { getInitialOrders } from './seedOrders';
import { advanceOrderStatus, TransitionResult } from '../features/orders/orderTransitions';

class MockOrderStore {
  private orders: Order[] = getInitialOrders();
  private listeners: Set<() => void> = new Set();

  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrdersByTab(tab: OrderViewTab): Order[] {
    const filtered = this.orders.filter((order) => {
      if (tab === 'pending') {
        return order.paymentStatus === 'pendingConfirmation';
      }
      if (tab === 'new') {
        return order.paymentStatus === 'confirmed' && order.operationalStatus === 'newOrder';
      }
      if (tab === 'preparing') {
        return order.paymentStatus === 'confirmed' && order.operationalStatus === 'preparing';
      }
      if (tab === 'ready') {
        return order.paymentStatus === 'confirmed' && order.operationalStatus === 'ready';
      }
      if (tab === 'delivered') {
        return order.paymentStatus === 'confirmed' && order.operationalStatus === 'delivered';
      }
      return false;
    });

    // Oldest first per specification (lowest timestamp first)
    return [...filtered].sort((a, b) => a.createdAt - b.createdAt);
  }

  public getCounts(): Record<OrderViewTab, number> {
    const counts: Record<OrderViewTab, number> = {
      pending: 0,
      new: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
    };

    for (const o of this.orders) {
      if (o.paymentStatus === 'pendingConfirmation') {
        counts.pending++;
      } else if (o.operationalStatus === 'newOrder') {
        counts.new++;
      } else if (o.operationalStatus === 'preparing') {
        counts.preparing++;
      } else if (o.operationalStatus === 'ready') {
        counts.ready++;
      } else if (o.operationalStatus === 'delivered') {
        counts.delivered++;
      }
    }

    return counts;
  }

  public advanceOrder(orderId: string): TransitionResult {
    const targetOrder = this.orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, errorMessage: 'الطلب غير موجود.' };
    }

    const result = advanceOrderStatus(targetOrder);
    if (result.success && result.order) {
      this.orders = this.orders.map((o) => (o.id === orderId ? result.order! : o));
      this.notify();
    }

    return result;
  }

  public resetToSeed(): void {
    this.orders = getInitialOrders();
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const orderStore = new MockOrderStore();

export function useOrderStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return orderStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return {
    orders: orderStore.getOrders(),
    getOrdersByTab: (tab: OrderViewTab) => orderStore.getOrdersByTab(tab),
    counts: orderStore.getCounts(),
    advanceOrder: (id: string) => orderStore.advanceOrder(id),
    resetToSeed: () => orderStore.resetToSeed(),
  };
}

