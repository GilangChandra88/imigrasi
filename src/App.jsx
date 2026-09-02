import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import MakSetup from './pages/MakSetup'
import NomorSuratKanim from './pages/NomorSuratKanim'
import Pegawai from './pages/Pegawai'
import SuratPerintah from './pages/SuratPerintah'
import SuratEditor from './pages/SuratEditor'
import TemplateBuilder from './pages/TemplateBuilder'
import SuratWriter from './pages/SuratWriter'
import { FaHome, FaSitemap, FaChevronLeft, FaChevronRight, FaFileAlt, FaUsers, FaFileSignature, FaLayerGroup } from 'react-icons/fa'
import { useState } from 'react'

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  const isActive = (prefix) => path === prefix || path.startsWith(prefix + '/');

  return (
    <nav className={`print:hidden ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 sticky top-0 transition-all duration-300 z-50`}>
      <div className={`p-4 sm:p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <span className="font-bold text-xl text-indigo-700 tracking-tight truncate mr-2">Imigrasi DB</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors shrink-0">
          {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>
      <div className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
        <Link 
          to="/" 
          title="Dashboard"
          className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <FaHome size={18} className="shrink-0" /> 
          {!isCollapsed && <span className="truncate">Dashboard</span>}
        </Link>
        <Link 
          to="/mak-setup" 
          title="MAK Setup"
          className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/mak-setup' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <FaSitemap size={18} className="shrink-0" /> 
          {!isCollapsed && <span className="truncate">MAK Setup</span>}
        </Link>
        <Link 
          to="/nomor-surat-kanim" 
          title="Nomor Surat Kanim"
          className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/nomor-surat-kanim' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <FaFileAlt size={18} className="shrink-0" /> 
          {!isCollapsed && <span className="truncate">Nomor Surat</span>}
        </Link>
        <Link 
          to="/Pegawai" 
          title="Pegawai"
          className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/Pegawai' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <FaUsers size={18} className="shrink-0" /> 
          {!isCollapsed && <span className="truncate">Pegawai</span>}
        </Link>
        <Link 
          to="/surat-perintah" 
          title="Surat Perintah"
          className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/surat-perintah' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <FaFileSignature size={18} className="shrink-0" /> 
          {!isCollapsed && <span className="truncate">Surat Perintah</span>}
        </Link>

        {/* Divider - Template Engine section */}
        {!isCollapsed && (
          <div className="pt-3 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Template Engine</p>
          </div>
        )}
        {isCollapsed && <div className="border-t border-slate-100 my-1" />}

        <Link 
          to="/surat-editor" 
          title="Surat Editor"
          className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${isActive('/surat-editor') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <FaLayerGroup size={18} className="shrink-0" /> 
          {!isCollapsed && <span className="truncate">Surat Editor</span>}
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible">
          <Routes>
            <Route path="/mak-setup" element={<MakSetup />} />
            <Route path="/nomor-surat-kanim" element={<NomorSuratKanim />} />
            <Route path="/Pegawai" element={<Pegawai />} />
            <Route path="/surat-perintah" element={<SuratPerintah />} />
            {/* Template Engine Routes */}
            <Route path="/surat-editor" element={<SuratEditor />} />
            <Route path="/surat-editor/builder" element={<TemplateBuilder />} />
            <Route path="/surat-editor/builder/:templateId" element={<TemplateBuilder />} />
            <Route path="/surat-editor/tulis/:templateId" element={<SuratWriter />} />
            <Route path="/" element={
              <div className="p-8 max-w-4xl mx-auto text-center mt-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold text-slate-800">Selamat Datang di Imigrasi Super Web</h1>
                <p className="mt-4 text-slate-500 font-medium">Pilih menu di panel sebelah kiri untuk mulai bekerja.</p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Link to="/mak-setup" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition-all">
                    Buka MAK Setup
                  </Link>
                  <Link to="/nomor-surat-kanim" className="inline-block bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 shadow-sm transition-all">
                    Buka Nomor Surat
                  </Link>
                  <Link to="/Pegawai" className="inline-block bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 shadow-sm transition-all">
                    Data Pegawai
                  </Link>
                  <Link to="/surat-perintah" className="inline-block bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 shadow-sm transition-all">
                    Surat Perintah
                  </Link>
                  <Link to="/surat-editor" className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 px-8 py-3 rounded-xl font-bold hover:bg-indigo-100 shadow-sm transition-all">
                    ✨ Surat Editor
                  </Link>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

// Trigger redeploy
