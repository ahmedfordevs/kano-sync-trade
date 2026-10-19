import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import NewSale from './NewSale';
import Inventory from './Inventory';

export default function App() {
  const [activeTab, setActiveTab] = useState('sales');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Automatically reactive database queries using Dexie React hooks
  const savedSales = useLiveQuery(() => db.sales.reverse().toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveProduct = async (newProduct) => {
    await db.products.add(newProduct);
  };

  const handleDeleteProduct = async (id) => {
    await db.products.delete(id);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24 text-slate-900">
      {/* Header */}
      <header className="max-w-md mx-auto px-4 pt-4 pb-2">
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl shadow-xs border border-slate-100">
          <div>
            <h1 className="font-extrabold text-slate-800 text-base tracking-tight">
              Kano-Sync <span className="text-emerald-600">Trade</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Dexie IndexedDB Engine</p>
          </div>
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}
          >
            <span className="text-[10px]">{isOnline ? '🟢' : '⚡'}</span>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-2">
        {activeTab === 'sales' ? (
          <NewSale 
            savedSales={savedSales} 
            products={products}
          />
        ) : (
          <Inventory 
            products={products} 
            onSaveProduct={handleSaveProduct} 
            onDeleteProduct={handleDeleteProduct} 
          />
        )}
      </main>

      {/* Floating Navigation Bar */}
      <nav className="fixed bottom-3 left-4 right-4 max-w-sm mx-auto bg-white/95 backdrop-blur-md border border-slate-200/80 p-1.5 flex justify-around shadow-lg rounded-2xl z-50">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center space-x-1.5 py-2.5 px-5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'sales' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🛒</span>
          <span>Tallace (POS)</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-1.5 py-2.5 px-5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'inventory' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📦</span>
          <span>Inventory</span>
        </button>
      </nav>
    </div>
  );
}