import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import SuratPreviewCanvas from './SuratPreviewCanvas';

/**
 * Komponen modal untuk mem-preview dokumen menggunakan PDF react-pdf.
 */
export default function SuratPreviewModal({ surat, onClose }) {
  const [loading, setLoading] = useState(true);

  // Simulasi loading sebentar agar komponen PDF siap
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const dummyData = surat.instanceData || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Preview: {surat.nama}</h2>
            <p className="text-sm text-slate-500">Pratinjau hasil akhir dokumen PDF</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden bg-slate-200 flex flex-col">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <FaSpinner className="animate-spin text-indigo-500 mb-4" size={32} />
              <p className="text-slate-600 font-medium animate-pulse">Menyiapkan pratinjau dokumen...</p>
            </div>
          ) : (
            <div className="flex-1 h-full w-full">
              <SuratPreviewCanvas surat={surat} formData={dummyData} packItem={surat._packItem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
