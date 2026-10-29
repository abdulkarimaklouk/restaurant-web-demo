export type PaymentStatus = 'pendingConfirmation' | 'confirmed';

export type OperationalStatus = 'newOrder' | 'preparing' | 'ready' | 'delivered';

export type OrderViewTab = 'pending' | 'new' | 'preparing' | 'ready' | 'delivered';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#1044"
  studentName: string; // e.g. "يوسف أحمد"
  studentFaculty?: string; // kept optional in data model, but omitted from display
  createdAt: number; // epoch ms for oldest-first sorting
  formattedRelativeTime: string; // e.g. "منذ ساعتين"
  items: OrderItem[];
  total: number; // calculated from items
  coins: number; // floor(total / 10)
  paymentStatus: PaymentStatus;
  operationalStatus: OperationalStatus;
  transactionRef: string; // 12-digit mock InstaPay reference
  senderHandle: string; // e.g. "youssef.ahmed@instapay"
  studentNote?: string;
  hasReceipt?: boolean; // whether receipt is attached for payment inspection
}
