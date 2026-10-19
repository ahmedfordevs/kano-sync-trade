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

// 1. Export entire Dexie database as a downloadable JSON file
export async function exportDatabaseToJson() {
  const sales = await db.sales.toArray();
  const products = await db.products.toArray();

  const backupData = {
    appName: 'Kano-Sync Trade',
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      sales,
      products
    }
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `kano_sync_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 2. Import JSON data file and restore tables in Dexie
export async function importDatabaseFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const backupObj = JSON.parse(e.target.result);

        if (!backupObj.data || !backupObj.data.sales || !backupObj.data.products) {
          throw new Error('Fayil din ba daidai yake ba (Invalid backup file format).');
        }

        // Execute atomic transaction to replace existing records
        await db.transaction('rw', db.sales, db.products, async () => {
          await db.sales.clear();
          await db.products.clear();

          if (backupObj.data.sales.length > 0) {
            await db.sales.bulkAdd(backupObj.data.sales);
          }
          if (backupObj.data.products.length > 0) {
            await db.products.bulkAdd(backupObj.data.products);
          }
        });

        resolve(true);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}