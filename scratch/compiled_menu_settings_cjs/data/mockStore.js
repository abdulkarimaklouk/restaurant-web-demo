"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStore = void 0;
exports.useOrderStore = useOrderStore;
const react_1 = require("react");
const seedOrders_1 = require("./seedOrders");
const orderTransitions_1 = require("../features/orders/orderTransitions");
const i18n_1 = require("../i18n");
class MockOrderStore {
    constructor() {
        this.orders = (0, seedOrders_1.getInitialOrders)();
        this.listeners = new Set();
    }
    getOrders() {
        return this.orders;
    }
    getOrdersByTab(tab) {
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
    getCounts() {
        const counts = {
            pending: 0,
            new: 0,
            preparing: 0,
            ready: 0,
            delivered: 0,
        };
        for (const o of this.orders) {
            if (o.paymentStatus === 'pendingConfirmation') {
                counts.pending++;
            }
            else if (o.operationalStatus === 'newOrder') {
                counts.new++;
            }
            else if (o.operationalStatus === 'preparing') {
                counts.preparing++;
            }
            else if (o.operationalStatus === 'ready') {
                counts.ready++;
            }
            else if (o.operationalStatus === 'delivered') {
                counts.delivered++;
            }
        }
        return counts;
    }
    advanceOrder(orderId) {
        const targetOrder = this.orders.find((o) => o.id === orderId);
        if (!targetOrder) {
            return {
                success: false,
                errorMessage: i18n_1.default.t('orders:toasts.orderNotFound', {
                    defaultValue: 'الطلب غير موجود.',
                }),
            };
        }
        const result = (0, orderTransitions_1.advanceOrderStatus)(targetOrder);
        if (result.success && result.order) {
            this.orders = this.orders.map((o) => (o.id === orderId ? result.order : o));
            this.notify();
        }
        return result;
    }
    resetToSeed() {
        this.orders = (0, seedOrders_1.getInitialOrders)();
        this.notify();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        this.listeners.forEach((l) => l());
    }
}
exports.orderStore = new MockOrderStore();
function useOrderStore() {
    const [, setTick] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        return exports.orderStore.subscribe(() => {
            setTick((t) => t + 1);
        });
    }, []);
    return {
        orders: exports.orderStore.getOrders(),
        getOrdersByTab: (tab) => exports.orderStore.getOrdersByTab(tab),
        counts: exports.orderStore.getCounts(),
        advanceOrder: (id) => exports.orderStore.advanceOrder(id),
        resetToSeed: () => exports.orderStore.resetToSeed(),
    };
}
