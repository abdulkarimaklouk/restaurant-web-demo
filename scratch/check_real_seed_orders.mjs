import fs from 'fs';
import path from 'path';

// Load seedOrders source directly and evaluate getInitialOrders
const seedSource = fs.readFileSync('./src/data/seedOrders.ts', 'utf8');

// We can build the orders in Node using the same logic
function buildMockSeedOrders(simulatedNow = Date.now()) {
  function buildOrder(
    id,
    orderNumber,
    studentName,
    studentFaculty,
    minutesAgo,
    itemsData,
    paymentStatus,
    operationalStatus,
    transactionRef,
    senderHandle,
    studentNote
  ) {
    const items = itemsData.map((it) => ({
      ...it,
      lineTotal: it.quantity * it.unitPrice,
    }));
    const total = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const createdAt = simulatedNow - minutesAgo * 60 * 1000;
    return {
      id,
      orderNumber,
      studentName,
      studentFaculty,
      createdAt,
      items,
      total,
      paymentStatus,
      operationalStatus,
      transactionRef,
      senderHandle,
      studentNote,
      hasReceipt: true,
    };
  }

  return [
    buildOrder('1044', '#1044', 'يوسف أحمد', 'علوم حاسب', 180, [{ id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90 }], 'pendingConfirmation', 'newOrder', '984210349281', 'youssef.ahmed@instapay'),
    buildOrder('1045', '#1045', 'سارة إبراهيم', 'هندسة عمارة', 120, [{ id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55 }, { id: 's-4', name: 'بطاطس بالجبنة', quantity: 1, unitPrice: 35 }, { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30 }], 'pendingConfirmation', 'newOrder', '472019385621', 'sara.ibrahim@instapay'),
    buildOrder('1046', '#1046', 'علي محمود', 'هندسة ميكانيكية', 60, [{ id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90 }, { id: 'm-3', name: 'مكرونة بشاميل بالفرن', quantity: 2, unitPrice: 50 }, { id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25 }], 'confirmed', 'newOrder', '819204716392', 'ali.mahmoud@instapay'),
    buildOrder('1047', '#1047', 'عمر خالد', 'إدارة أعمال', 35, [{ id: 'm-1', name: 'وجبة كشري', quantity: 2, unitPrice: 40 }, { id: 'd-2', name: 'شاي ساخن', quantity: 2, unitPrice: 10 }], 'confirmed', 'newOrder', '309184729104', 'omar.khaled@instapay'),
    buildOrder('1048', '#1048', 'منى أحمد', 'طب بشري', 15, [{ id: 's-1', name: 'شاورما دجاج', quantity: 2, unitPrice: 55 }, { id: 'd-1', name: 'عصير برتقال طازج', quantity: 2, unitPrice: 30 }], 'confirmed', 'preparing', '192837465019', 'mona.ahmed@instapay'),
    buildOrder('1049', '#1049', 'كريم طارق', 'صيدلة', 10, [{ id: 'm-3', name: 'مكرونة بشاميل بالفرن', quantity: 1, unitPrice: 50 }, { id: 's-4', name: 'بطاطس بالجبنة', quantity: 1, unitPrice: 35 }, { id: 'd-3', name: 'مياه معدنية', quantity: 1, unitPrice: 8 }], 'confirmed', 'preparing', '501928374612', 'kareem.tarek@instapay'),
    buildOrder('1050', '#1050', 'نور الدين', 'علوم كيمياء', 5, [{ id: 'm-2', name: 'وجبة دجاج مشوي', quantity: 1, unitPrice: 90 }, { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30 }], 'confirmed', 'ready', '681920384756', 'nour.eldeen@instapay'),
    buildOrder('1041', '#1041', 'سلمى حسن', 'فنون تطبيقية', 90, [{ id: 'm-1', name: 'وجبة كشري', quantity: 1, unitPrice: 40 }, { id: 'd-2', name: 'شاي ساخن', quantity: 2, unitPrice: 10 }], 'confirmed', 'delivered', '719283019284', 'salma.hassan@instapay'),
    buildOrder('1042', '#1042', 'محمود عادل', 'حقوق', 80, [{ id: 's-3', name: 'فول وفلافل', quantity: 2, unitPrice: 20 }, { id: 'd-3', name: 'مياه معدنية', quantity: 1, unitPrice: 8 }], 'confirmed', 'delivered', '829103948571', 'mahmoud.adel@instapay'),
    buildOrder('1043', '#1043', 'هدى مصطفى', 'آداب إعلام', 70, [{ id: 'ds-1', name: 'كيكة الشوكولاتة', quantity: 1, unitPrice: 25 }, { id: 'd-1', name: 'عصير برتقال طازج', quantity: 1, unitPrice: 30 }], 'confirmed', 'delivered', '930192847561', 'hoda.mostafa@instapay')
  ];
}

import {
  resolveDatePreset,
  isTimestampInRange
} from './compiled_analytics/features/analytics/utils/dateRangeUtils.js';

import {
  generateAnalyticsDataSet,
  filterQualifiedOrders
} from './compiled_analytics/features/analytics/utils/analyticsCalculations.js';

// Test with November 1, 2026 at current local time: 20:28:40 (8:28 PM)
const testDate = new Date(2026, 10, 1, 20, 28, 40); // Month is 0-indexed: 10 = November
const simulatedNow = testDate.getTime();
const orders = buildMockSeedOrders(simulatedNow);

console.log('--- ACTUAL SEED ORDER TIMESTAMPS ON NOV 1, 2026 20:28:40 ---');
for (const o of orders) {
  const d = new Date(o.createdAt);
  console.log(`Order ${o.orderNumber}: createdAt = ${d.toLocaleTimeString()} (${d.toISOString()}), status = ${o.paymentStatus}/${o.operationalStatus}, total = ${o.total} EGP`);
}

// 1. TODAY
const todayRes = resolveDatePreset('today', simulatedNow);
const todayOrders = orders.filter((o) => isTimestampInRange(o.createdAt, todayRes.currentRange));
const todayData = generateAnalyticsDataSet(orders, 'today', simulatedNow);

console.log('\n--- TODAY RANGE ---');
console.log(`Range: ${new Date(todayRes.currentRange.start).toLocaleString()} to ${new Date(todayRes.currentRange.end).toLocaleString()}`);
console.log(`Orders in Today Range: ${todayOrders.length} / 10`);
console.log(`Qualified Confirmed Orders: ${todayData.filteredOrders.length} / 8`);
console.log(`Total Sales: ${todayData.kpis.totalSales} EGP`);
console.log(`Total Orders: ${todayData.kpis.totalOrders}`);
console.log(`Items Sold: ${todayData.kpis.itemsSold}`);
console.log(`Average Order Value: ${todayData.kpis.averageOrderValue} EGP`);

// 2. THIS WEEK
const weekRes = resolveDatePreset('week', simulatedNow);
const weekOrders = orders.filter((o) => isTimestampInRange(o.createdAt, weekRes.currentRange));
const weekData = generateAnalyticsDataSet(orders, 'week', simulatedNow);

console.log('\n--- THIS WEEK RANGE ---');
console.log(`Range: ${new Date(weekRes.currentRange.start).toLocaleString()} to ${new Date(weekRes.currentRange.end).toLocaleString()}`);
console.log(`Orders in This Week Range: ${weekOrders.length} / 10`);
console.log(`Total Sales: ${weekData.kpis.totalSales} EGP`);

// 3. THIS MONTH
const monthRes = resolveDatePreset('month', simulatedNow);
const monthOrders = orders.filter((o) => isTimestampInRange(o.createdAt, monthRes.currentRange));
const monthData = generateAnalyticsDataSet(orders, 'month', simulatedNow);

console.log('\n--- THIS MONTH RANGE ---');
console.log(`Range: ${new Date(monthRes.currentRange.start).toLocaleString()} to ${new Date(monthRes.currentRange.end).toLocaleString()}`);
console.log(`Orders in This Month Range: ${monthOrders.length} / 10`);
console.log(`Total Sales: ${monthData.kpis.totalSales} EGP`);

