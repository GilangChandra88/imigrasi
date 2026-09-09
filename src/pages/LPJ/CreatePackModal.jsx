/**
 * CreatePackModal — Modal Buat Paket LPJ Baru
 * =============================================
 * Siapapun (admin maupun member biasa) bisa membuat paket baru.
 * Wizard 3 langkah: Tipe → Info Kegiatan → Preview
 * Pegawai yang terlibat (jika perjadin) diisi di langkah info.
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { createLPJPack } from './useLPJ';
import { PACK_TYPES, generateSuratItems } from './packTemplates';
import { FaTimes, FaPlus, FaUserPlus, FaFolderOpen, FaRegFileAlt, FaCircleNotch } from 'react-icons/fa';

export default function CreatePackModal({ onClose, onCreated, currentUser }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: '',
    judul: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const displayName = currentUser.displayName || currentUser.email || 'Pengguna';
      const packId = await createLPJPack({
        type: form.type,
        judul: form.judul,
        perihal: '',
        tujuan: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        mak: '',
        pegawai_list: [],
        created_by: { uid: currentUser.uid, nama: displayName },
      });
      onCreated(packId);
    } catch (err) {
      console.error('createLPJPack error:', err);
      alert('Gagal membuat paket. Periksa konsol untuk detail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!form.type && !!form.judul;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Buat Paket LPJ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Mulai paket pertanggungjawaban baru</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <FaTimes size={15} />
          </button>
        </div>

        {/* Konten */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Judul Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Paket LPJ <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="contoh: Bimtek Imigrasi Jakarta — Jan 2025"
              value={form.judul}
              onChange={(e) => set('judul', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Pilih Tipe */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Kegiatan <span className="text-rose-500">*</span></label>
            <div className="grid gap-3">
              {Object.values(PACK_TYPES).map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => set('type', pt.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    form.type === pt.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${form.type === pt.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {pt.id === 'perjadin' ? <FaFolderOpen size={20} /> : <FaRegFileAlt size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-base">{pt.label}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {pt.id === 'perjadin'
                          ? 'Mencakup Surat Perintah, SPD, SPBY, hingga Laporan.'
                          : 'Mencakup Nota Dinas, SPB, Kwitansi, hingga Laporan.'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Paket akan memuat dokumen-dokumen standar secara otomatis. <br/>Untuk kegiatan Perjalanan Dinas, SPD per pegawai otomatis disinkronkan dari data Pegawai di form Surat Perintah.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between gap-3 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isSubmitting
              ? <><FaCircleNotch className="animate-spin" /> Membuat...</>
              : <>Buat Paket LPJ</>}
          </button>
        </div>
      </div>
    </div>
  );
}
