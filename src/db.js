import Dexie from 'dexie';

export const db = new Dexie('KanoSyncTradeDB');

db.version(1).stores({
  sales: '++id, customerName, itemName, paymentMethod, date, synced, settledAt',
  products: '++id, name, category, price, stock, unit'
});

// Helper function to settle a credit sale
export async function settleBashiCredit(saleId, settledPaymentMethod = 'cash') {
  await db.sales.update(saleId, {
    paymentMethod: 'bashi-paid',
    settledMethod: settledPaymentMethod,
    settledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
}