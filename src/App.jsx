import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import MakSetup from './pages/MakSetup'
import NomorSuratKanim from './pages/NomorSuratKanim'
import Pegawai from './pages/Pegawai'
import SuratEditor from './pages/SuratEditor'
import TemplateBuilder from './pages/TemplateBuilder'
import SuratWriter from './pages/SuratWriter'
import TemplateBuilderV2 from './pages/TemplateBuilderV2'
import SuratWriterV2 from './pages/SuratWriterV2'
import TemplateListV2 from './pages/TemplateListV2'
import Dashboard from './pages/Dashboard'
import { FaHome, FaSitemap, FaChevronLeft, FaChevronRight, FaFileAlt, FaUsers, FaLayerGroup, FaSignOutAlt } from 'react-icons/fa'
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const { isSuperAdmin, isAdmin, currentUser, userData, userRole } = useAuth();

  const isActive = (prefix) => path === prefix || path.startsWith(prefix + '/');

  const handleLogout = async () => {
    await signOut(auth);
  };

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
        
        {isSuperAdmin && (
          <Link 
            to="/mak-setup" 
            title="MAK Setup"
            className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/mak-setup' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <FaSitemap size={18} className="shrink-0" /> 
            {!isCollapsed && <span className="truncate">MAK Setup</span>}
          </Link>
        )}

        {isAdmin && (
          <Link 
            to="/nomor-surat-kanim" 
            title="Nomor Surat Kanim"
            className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${path === '/nomor-surat-kanim' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <FaFileAlt size={18} className="shrink-0" /> 
            {!isCollapsed && <span className="truncate">Nomor Surat</span>}
          </Link>
        )}

        {isSuperAdmin && (
          <Link 
            to="/Pegawai" 
            title="Pegawai"
            className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${isActive('/Pegawai') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <FaUsers size={18} className="shrink-0" /> 
            {!isCollapsed && <span className="truncate">Data Pegawai</span>}
          </Link>
        )}

        {isAdmin && (
          <Link 
            to="/surat-editor" 
            title="Template Builder"
            className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${isActive('/surat-editor') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <FaLayerGroup size={18} className="shrink-0" /> 
            {!isCollapsed && <span className="truncate">Template Builder</span>}
          </Link>
        )}

        {isAdmin && (
          <Link 
            to="/templates-v2" 
            title="Template V2"
            className={`flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${isActive('/templates-v2') || isActive('/builder-v2') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <FaLayerGroup size={18} className="shrink-0" /> 
            {!isCollapsed && <span className="truncate">Template V2</span>}
          </Link>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 mt-auto">
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-800 truncate">{userData?.nama || currentUser.email}</p>
            <p className="text-[10px] text-slate-500 truncate">{userRole || 'Pegawai'}</p>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 font-bold text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 p-3 rounded-xl transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt size={16} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, requireRole }) {
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  
  if (requireRole === 'Super Admin' && !isSuperAdmin) return <Navigate to="/" />;
  if (requireRole === 'Admin' && !isAdmin) return <Navigate to="/" />;
  
  return children;
}

function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        {currentUser && <Sidebar />}

        <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/mak-setup" element={
              <ProtectedRoute requireRole="Super Admin"><MakSetup /></ProtectedRoute>
            } />
            
            <Route path="/nomor-surat-kanim" element={
              <ProtectedRoute requireRole="Admin"><NomorSuratKanim /></ProtectedRoute>
            } />
            
            <Route path="/Pegawai" element={
              <ProtectedRoute requireRole="Super Admin"><Pegawai /></ProtectedRoute>
            } />
            
            <Route path="/surat-editor" element={
              <ProtectedRoute requireRole="Admin"><SuratEditor /></ProtectedRoute>
            } />
            
            <Route path="/surat-editor/builder/:templateId?" element={
              <ProtectedRoute requireRole="Admin"><TemplateBuilder /></ProtectedRoute>
            } />

            <Route path="/surat-editor/tulis/:templateId" element={
              <ProtectedRoute><SuratWriter /></ProtectedRoute>
            } />

            {/* Builder 2.0 Routes */}
            <Route path="/templates-v2" element={
              <ProtectedRoute requireRole="Admin"><TemplateListV2 /></ProtectedRoute>
            } />
            
            <Route path="/builder-v2" element={
              <ProtectedRoute requireRole="Admin"><TemplateBuilderV2 /></ProtectedRoute>
            } />
            
            <Route path="/builder-v2/:templateId" element={
              <ProtectedRoute requireRole="Admin"><TemplateBuilderV2 /></ProtectedRoute>
            } />
            
            <Route path="/writer-v2/:templateId" element={
              <ProtectedRoute><SuratWriterV2 /></ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
