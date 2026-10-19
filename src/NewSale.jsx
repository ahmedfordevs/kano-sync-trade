import React, { useState } from 'react';
import { db } from './db';

export default function NewSale({ savedSales, products }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'transfer', 'bashi'
  const [searchQuery, setSearchQuery] = useState('');

  // Handle dropdown selection from inventory
  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);

    if (prodId === 'custom') {
      setItemName('');
      setPrice('');
      setQuantity(1);
      return;
    }

    const foundProd = products.find((p) => p.id.toString() === prodId);
    if (foundProd) {
      setItemName(foundProd.name);
      setPrice(foundProd.price);
      setQuantity(1);
    }
  };

  // Save sale asynchronously to IndexedDB using Dexie
  const handleSaveSale = async (e) => {
    e.preventDefault();

    if (!itemName || !price) {
      alert('Tabbatar ka shigar da sunan kaya da farashi!');
      return;
    }

    const unitPrice = parseFloat(price);
    const totalAmount = unitPrice * parseInt(quantity, 10);

    try {
      // 1. Add sale record to Dexie IndexedDB table
      await db.sales.add({
        customerName: customerName || 'General Customer',
        itemName: `${itemName} (x${quantity})`,
        price: totalAmount,
        paymentMethod,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        synced: false
      });

      // 2. Automatically deduct stock from Dexie products table if selected from catalog
      if (selectedProductId && selectedProductId !== 'custom') {
        const prodIdNum = parseInt(selectedProductId, 10);
        const currentProd = products.find((p) => p.id === prodIdNum);
        if (currentProd) {
          const newStock = Math.max(0, currentProd.stock - parseInt(quantity, 10));
          await db.products.update(prodIdNum, { stock: newStock });
        }
      }

      // Reset form inputs
      setCustomerName('');
      setItemName('');
      setPrice('');
      setQuantity(1);
      setSelectedProductId('');
      setPaymentMethod('cash');
      alert('✅ An adana tallan sannan an rage stock a indexedDB!');
    } catch (error) {
      console.error('Kuskure wajen adana tallace:', error);
      alert('An samu matsala wajen adanawa.');
    }
  };

  // Calculate totals
  const totalSalesAmount = savedSales.reduce((acc, sale) => acc + sale.price, 0);
  const totalBashiAmount = savedSales
    .filter((sale) => sale.paymentMethod === 'bashi')
    .reduce((acc, sale) => acc + sale.price, 0);

  // Live filter for transactions
  const filteredSales = savedSales.filter((sale) => {
    const query = searchQuery.toLowerCase();
    return (
      sale.customerName.toLowerCase().includes(query) ||
      sale.itemName.toLowerCase().includes(query) ||
      sale.paymentMethod.toLowerCase().includes(query)
    );
  });

  // Generate WhatsApp Receipt
  const getWhatsAppLink = (sale) => {
    let message =
      `Sannu ${sale.customerName}! Nagode da sayayya a shagonmu.\n\n` +
      `📦 *Kaya:* ${sale.itemName}\n` +
      `💰 *Jimillar Kudi:* ₦${sale.price.toLocaleString()}\n` +
      `💳 *Hanyar Biya:* ${sale.paymentMethod.toUpperCase()}\n`;

    if (sale.paymentMethod === 'bashi') {
      message += `⚠️ *Lura:* Wannan bashin ne (Credit Sale).\n`;
    }

    message += `\nSai mun sake ganin ku! 🙏`;

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-4">
      {/* Dashboard KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jimillar Tallace</p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            ₦{totalSalesAmount.toLocaleString()}
          </p>
          <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {savedSales.length} Total Sales
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jimillar Bashi</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            ₦{totalBashiAmount.toLocaleString()}
          </p>
          <span className="inline-block mt-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Pending Credit
          </span>
        </div>
      </div>

      {/* New Sale Input Form */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Shigar da Sabuwar Sayayya</span>
          <span className="text-[10px] text-emerald-600 font-normal">IndexedDB Offline POS</span>
        </h2>

        <form onSubmit={handleSaveSale} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Zaɓi Kaya Daga Inventory
            </label>
            <select
              value={selectedProductId}
              onChange={handleProductSelect}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium text-slate-700"
            >
              <option value="">-- Zaɓi kaya daga shago --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} — ₦{prod.price.toLocaleString()} ({prod.stock} {prod.unit} left)
                </option>
              ))}
              <option value="custom">+ Shigar da kaya daban (Custom Entry)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Sunan Aboki (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Alhaji Sani"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Kaya / Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Atampa Lace"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Farashi (Unit Price ₦) *
              </label>
              <input
                type="number"
                placeholder="15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Adadi / Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Hanyar Biya / Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
            >
              <option value="cash">Cash (Kuɗi a Hannu)</option>
              <option value="transfer">Bank Transfer</option>
              <option value="bashi">Bashi (Credit / Rikodin Bashi)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition shadow-md shadow-emerald-600/20 text-xs mt-2"
          >
            💾 Adana Sayayya (Save Offline)
          </button>
        </form>
      </div>

      {/* Recent Transactions List with Live Search */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Fayil din Sayayya ({filteredSales.length})
          </h3>

          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Nemi aboki, kaya, ko bashi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Babu sakamakon bincike.' : 'Babu sayayya da aka adana ba tukuna.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-bold text-xs text-slate-800">{sale.itemName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sale.customerName} • {sale.date}
                  </p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      sale.paymentMethod === 'bashi'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {sale.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-xs text-slate-900">
                    ₦{sale.price.toLocaleString()}
                  </p>
                  <a
                    href={getWhatsAppLink(sale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 mt-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    <span>📲 Risit</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}