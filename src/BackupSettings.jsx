import React, { useRef, useState } from 'react';
import { exportDatabaseToJson, importDatabaseFromJson } from './db';

export default function BackupSettings() {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      await exportDatabaseToJson();
      alert('✅ An sauke fayil din ajiya (Backup downloaded successfully)!');
    } catch (err) {
      console.error('Kuskure wajen ajiye fayil:', err);
      alert('An samu matsala wajen fitar da fayil din ajiya.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      '⚠️ SHIN KANA DA TARRAN SHIGAR DA WANNAN FAYIL?\n\nWannan zai sake maido da duk bayanan tallace da kayayyakin da kake da su!'
    );

    if (!confirmRestore) return;

    setIsImporting(true);
    try {
      await importDatabaseFromJson(file);
      alert('🎉 An maido da duk bayanan nasara (Backup restored successfully)!');
      window.location.reload(); // Reload to refresh Dexie live queries
    } catch (err) {
      console.error('Kuskure wajen maido da fayil:', err);
      alert(`An samu matsala: ${err.message}`);
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 space-y-4">
      <div>
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Kariya da Ajiye Bayanai (Data Backup & Restore)
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Ajiye fayil din bayanan kasuwancinka don kar ka rasa su idan waya ta bata ko ka canza na'ura.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold p-3 rounded-xl transition text-xs flex flex-col items-center justify-center space-y-1 shadow-xs"
        >
          <span className="text-base">📥</span>
          <span>Ajiye Backup (JSON)</span>
        </button>

        {/* Import Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-[0.98] text-emerald-700 font-bold p-3 rounded-xl transition text-xs flex flex-col items-center justify-center space-y-1 shadow-xs"
        >
          <span className="text-base">📤</span>
          <span>{isImporting ? 'Yana Maido da...' : 'Maido da Backup'}</span>
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
}