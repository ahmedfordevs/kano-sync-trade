import React, { useState, useEffect } from 'react';

export default function NewSale() {
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'transfer', 'bashi'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedSales, setSavedSales] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const existingSales = JSON.parse(localStorage.getItem('kano_sales') || '[]');
    setSavedSales(existingSales);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveSale = (e) => {
    e.preventDefault();

    if (!itemName || !price) {
      alert('Tabbatar ka shigar da sunan kaya da farashi!');
      return;
    }

    const newSale = {
      id: Date.now(),
      customerName: customerName || 'General Customer',
      itemName,
      price: parseFloat(price),
      paymentMethod,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      synced: false
    };

    const updatedSales = [newSale, ...savedSales];
    setSavedSales(updatedSales);
    localStorage.setItem('kano_sales', JSON.stringify(updatedSales));

    setCustomerName('');
    setItemName('');
    setPrice('');
    setPaymentMethod('cash');
    alert('✅ An adana tallan cikin nasara!');
  };

  // --- DASHBOARD METRICS CALCULATIONS ---
  const totalSalesAmount = savedSales.reduce((acc, sale) => acc + sale.price, 0);
  
  const totalBashiAmount = savedSales
    .filter((sale) => sale.paymentMethod === 'bashi')
    .reduce((acc, sale) => acc + sale.price, 0);

  const totalTransactionsCount = savedSales.length;

  const getWhatsAppLink = (sale) => {
    let message = `Sannu ${sale.customerName}! Nagode da sayayya a shagonmu.\n\n` +
      `📦 *Kaya:* ${sale.itemName}\n` +
      `💰 *Kudi:* ₦${sale.price.toLocaleString()}\n` +
      `💳 *Hanyar Biya:* ${sale.paymentMethod.toUpperCase()}\n`;
      
    if (sale.paymentMethod === 'bashi') {
      message += `⚠️ *Lura:* Wannan bashin ne (Credit Sale).\n`;
    }
    
    message += `\nSai mun sake ganin ku! 🙏`;

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen font-sans pb-10">
      {/* Network Status Header */}
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-xl shadow-sm border">
        <h1 className="font-bold text-gray-800 text-base">Kano-Sync Trade (POS)</h1>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isOnline ? '🟢 Online' : '⚡ Offline'}
        </span>
      </div>

      {/* --- SUMMARY DASHBOARD CARDS --- */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border">
          <p className="text-[11px] font-semibold text-gray-500 uppercase">Jimillar Tallace</p>
          <p className="text-lg font-black text-green-700 mt-1">
            ₦{totalSalesAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{totalTransactionsCount} Transactions</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl shadow-sm border">
          <p className="text-[11px] font-semibold text-gray-500 uppercase">Jimillar Bashi (Credit)</p>
          <p className="text-lg font-black text-amber-600 mt-1">
            ₦{totalBashiAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">A Biyan Kuɗi</p>
        </div>
      </div>

      {/* New Sale Form */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Shigar da Sabuwar Sayayya</h2>
        <form onSubmit={handleSaveSale} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Sunan Aboki / Buyer Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Alhaji Sani"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Kaya / Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Atampa Lace"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Farashi / Price (₦) *
            </label>
            <input
              type="number"
              placeholder="15000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Hanyar Biya / Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="cash">Cash (Kuɗi a Hannu)</option>
              <option value="transfer">Bank Transfer</option>
              <option value="bashi">Bashi (Credit / Rikodin Bashi)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm text-xs mt-1"
          >
            💾 Adana (Save Offline)
          </button>
        </form>
      </div>

      {/* Saved Sales List */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-xs">
          Fayil din Sayayya ({savedSales.length})
        </h3>
        {savedSales.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Babu sayayya da aka adana ba tukuna.</p>
        ) : (
          <div className="space-y-2.5">
            {savedSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-xs"
              >
                <div>
                  <p className="font-bold text-xs text-gray-800">{sale.itemName}</p>
                  <p className="text-[11px] text-gray-500">
                    {sale.customerName} • {sale.date}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold ${
                      sale.paymentMethod === 'bashi'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {sale.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-green-700">
                    ₦{sale.price.toLocaleString()}
                  </p>
                  <a
                    href={getWhatsAppLink(sale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-[11px] text-green-600 hover:underline font-semibold"
                  >
                    📲 Risit
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