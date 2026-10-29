import { Order, OrderItem } from '../types/order';
import { calculateCoins } from '../utils/calculateCoins';

function buildOrder(
  id: string,
  orderNumber: string,
  studentName: string,
  studentFaculty: string,
  minutesAgo: number,
  itemsData: Array<{ id: string; name: string; quantity: number; unitPrice: number }>,
  paymentStatus: 'pendingConfirmation' | 'confirmed',
  operationalStatus: 'newOrder' | 'preparing' | 'ready' | 'delivered',
  transactionRef: string,
  senderHandle: string,
  studentNote?: string
): Order {
  const items: OrderItem[] = itemsData.map((it) => ({
    ...it,
    lineTotal: it.quantity * it.unitPrice,
  }));

  const total = items.reduce((sum, it) => sum + it.lineTotal, 0);
  const now = Date.now();
  const createdAt = now - minutesAgo * 60 * 1000;

  let formattedRelativeTime = '';
  if (minutesAgo >= 180) {
    formattedRelativeTime = 'منذ ٣ ساعات';
  } else if (minutesAgo >= 120) {
    formattedRelativeTime = 'منذ ساعتين';
  } else if (minutesAgo >= 60) {
    formattedRelativeTime = 'منذ ساعة';
  } else if (minutesAgo >= 3) {
    formattedRelativeTime = `منذ ${minutesAgo} دقيقة`;
  } else {
    formattedRelativeTime = 'الآن';
  }

  return {
    id,
    orderNumber,
    studentName,
    studentFaculty,
    createdAt,
    formattedRelativeTime,
    items,
    total,
    coins: calculateCoins(total),
    paymentStatus,
    operationalStatus,
    transactionRef,
    senderHandle,
    studentNote,
    hasReceipt: true,
  };
}

export function getInitialOrders(): Order[] {
  return [
    // 1. Pending payment confirmation (2 orders)
    buildOrder(
      '1044',
      '#1044',
      'يوسف أحمد',
      'علوم حاسب',
      180, // 3 hours ago
      [{ id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90 }],
      'pendingConfirmation',
      'newOrder',
      '984210349281',
      'youssef.ahmed@instapay',
      'الرجاء تسليم الأكل ساخناً'
    ),
    buildOrder(
      '1045',
      '#1045',
      'سارة إبراهيم',
      'هندسة عمارة',
      120, // 2 hours ago
      [
        { id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55 },
        { id: 's-4', name: 'بطاطس بالجبنة', quantity: 1, unitPrice: 35 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30 },
      ],
      'pendingConfirmation',
      'newOrder',
      '472019385621',
      'sara.ibrahim@instapay'
    ),

    // 2. New with confirmed payment (2 orders)
    buildOrder(
      '1046',
      '#1046',
      'علي محمود',
      'هندسة ميكانيكية',
      60, // 1 hour ago
      [
        { id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90 },
        { id: 'm-3', name: 'مكرونة بشاميل بالفرن', quantity: 2, unitPrice: 50 },
        { id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25 },
      ],
      'confirmed',
      'newOrder',
      '819204716392',
      'ali.mahmoud@instapay'
    ),
    buildOrder(
      '1047',
      '#1047',
      'عمر خالد',
      'إدارة أعمال',
      35,
      [
        { id: 'm-1', name: 'وجبة كشري', quantity: 2, unitPrice: 40 },
        { id: 'd-2', name: 'شاي ساخن', quantity: 2, unitPrice: 10 },
      ],
      'confirmed',
      'newOrder',
      '309184729104',
      'omar.khaled@instapay',
      'بدون شطة من فضلك'
    ),

    // 3. Preparing (2 orders)
    buildOrder(
      '1048',
      '#1048',
      'منى أحمد',
      'طب بشري',
      15,
      [
        { id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 2, unitPrice: 30 },
      ],
      'confirmed',
      'preparing',
      '192837465019',
      'mona.ahmed@instapay'
    ),
    buildOrder(
      '1049',
      '#1049',
      'كريم طارق',
      'صيدلة',
      10,
      [
        { id: 'm-3', name: 'مكرونة بشاميل بالفرن', quantity: 1, unitPrice: 50 },
        { id: 's-4', name: 'بطاطس بالجبنة', quantity: 1, unitPrice: 35 },
        { id: 'd-3', name: 'مياه معدنية', quantity: 1, unitPrice: 8 },
      ],
      'confirmed',
      'preparing',
      '501928374612',
      'kareem.tarek@instapay'
    ),

    // 4. Ready for collection (1 order)
    buildOrder(
      '1050',
      '#1050',
      'نور الدين',
      'علوم كيمياء',
      5,
      [
        { id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30 },
      ],
      'confirmed',
      'ready',
      '681920384756',
      'nour.eldeen@instapay'
    ),

    // 5. Delivered (3 orders)
    buildOrder(
      '1041',
      '#1041',
      'سلمى حسن',
      'فنون تطبيقية',
      90,
      [
        { id: 'm-1', name: 'وجبة كشري', quantity: 1, unitPrice: 40 },
        { id: 'd-2', name: 'شاي ساخن', quantity: 2, unitPrice: 10 },
      ],
      'confirmed',
      'delivered',
      '719283019284',
      'salma.hassan@instapay'
    ),
    buildOrder(
      '1042',
      '#1042',
      'محمود عادل',
      'حقوق',
      80,
      [
        { id: 's-3', name: 'فول وفلافل', quantity: 2, unitPrice: 20 },
        { id: 'd-3', name: 'مياه معدنية', quantity: 1, unitPrice: 8 },
      ],
      'confirmed',
      'delivered',
      '829103948571',
      'mahmoud.adel@instapay'
    ),
    buildOrder(
      '1043',
      '#1043',
      'هدى مصطفى',
      'آداب إعلام',
      70,
      [
        { id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25 },
        { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30 },
      ],
      'confirmed',
      'delivered',
      '930192847561',
      'hoda.mostafa@instapay'
    ),
  ];
}
