import Dexie from 'dexie';

export const db = new Dexie('KanoSyncTradeDB');

// Define database schema and indexed primary/secondary keys
db.version(1).stores({
  sales: '++id, customerName, itemName, paymentMethod, date, synced',
  products: '++id, name, category, price, stock, unit'
});