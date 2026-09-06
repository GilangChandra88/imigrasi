import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function TemplateListV2() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'templates_v2'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTemplates(list);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Yakin ingin menghapus template "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'templates_v2', id));
        setTemplates(templates.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Gagal menghapus template');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Template V2</h1>
          <p className="text-sm text-slate-500">Kelola semua template cerdas Builder 2.0</p>
        </div>
        <Link 
          to="/builder-v2" 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Buat Template Baru
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">Memuat template...</div>
        ) : templates.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">Belum ada template</h3>
            <p className="text-slate-500 mb-6">Mulai buat template dokumen cerdas pertama Anda.</p>
            <Link to="/builder-v2" className="text-indigo-600 font-medium hover:underline">
              Buat Template Sekarang &rarr;
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Judul Template</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Jumlah Variabel</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Dibuat Pada</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-slate-800">{tpl.title}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {tpl.variables?.length || 0} Variabel
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {tpl.createdAt?.toDate ? tpl.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/writer-v2/${tpl.id}`)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-sm font-medium transition-colors"
                        title="Uji Coba Pengisian (Writer V2)"
                      >
                        Uji Coba
                      </button>
                      <button 
                        onClick={() => navigate(`/builder-v2/${tpl.id}`)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
                        title="Edit Template"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(tpl.id, tpl.title)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-sm font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
