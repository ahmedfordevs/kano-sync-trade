import React, { useState } from 'react';

export default function Inventory({ products, onSaveProduct, onDeleteProduct }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Atampa / Fabrics');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('yards');

  // Search state for inventory filtering
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      alert('Tabbatar ka cika duk filayen da ake bukata!');
      return;
    }

    const newProduct = {
      id: Date.now(),
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      unit
    };

    onSaveProduct(newProduct);
    setName('');
    setPrice('');
    setStock('');
    alert('✅ An adana sabon kaya cikin inventory!');
  };

  // Filter products by search query
  const filteredProducts = products.filter((prod) => {
    const query = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Add Product Form */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Ƙara Sabon Kaya a Inventory
        </h2>

        <form onSubmit={handleAddProduct} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sunan Kaya / Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Brocade Velvet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Farashi (₦) *</label>
              <input
                type="number"
                placeholder="25000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Adadi / Stock *</label>
              <input
                type="number"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nau'in Awo / Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
              >
                <option value="yards">Yards</option>
                <option value="pcs">Pieces (Pcs)</option>
                <option value="cartons">Cartons</option>
                <option value="bundles">Bundles</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kashi / Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition shadow-md shadow-emerald-600/20 text-xs mt-1"
          >
            📦 Ajiye a Inventory (Save Product)
          </button>
        </form>
      </div>

      {/* Inventory Catalog List with Live Search */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Kayayyakin Dake Shago ({filteredProducts.length})
          </h3>

          {/* Inventory Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Nemi kaya a shago..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Babu kaya da aka samu da wannan sunan.' : 'Babu kaya a inventory tukuna.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-bold text-xs text-slate-800">{prod.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Stock:{' '}
                    <span
                      className={
                        prod.stock <= 5
                          ? 'text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded'
                          : 'text-slate-700 font-semibold'
                      }
                    >
                      {prod.stock} {prod.unit}
                    </span>{' '}
                    • {prod.category}
                  </p>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <div>
                    <p className="font-extrabold text-xs text-slate-900">
                      ₦{prod.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteProduct(prod.id)}
                    className="text-slate-300 hover:text-red-600 transition text-xs font-bold p-1"
                    title="Goge kaya"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}