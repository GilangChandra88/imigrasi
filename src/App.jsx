import React, { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import MakSetup from './pages/MakSetup'
import MakHistory from './pages/MakHistory'
import NomorSuratKanim from './pages/NomorSuratKanim'
import Pegawai from './pages/Pegawai'
import Dashboard from './pages/Dashboard'
import Persuratan from './pages/Persuratan/index'
import SuratForm from './pages/Persuratan/SuratForm'
import LPJ from './pages/LPJ/index'
import { 
  FaHome, FaSitemap, FaFileAlt, FaUsers, 
  FaSignOutAlt, FaEnvelope, FaFolderOpen, 
  FaHistory, FaSun, FaMoon, FaBars 
} from 'react-icons/fa'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const path = location.pathname;
  const { isSuperAdmin, isAdmin, currentUser, userData, userRole } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }

  const isActive = (prefix) => path === prefix || path.startsWith(prefix + '/');
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItemClass = (active) => `
    flex items-center gap-3 py-2.5 px-4 rounded-xl font-medium transition-all text-sm
    ${active 
      ? 'bg-blue-600/20 text-blue-400 shadow-sm' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'} 
    ${isCollapsed ? 'md:justify-center px-4 md:px-0' : ''}
  `;

  return (
    <nav className={`print:hidden bg-[#1e293b] border-r border-slate-800 flex flex-col h-screen shrink-0 transition-all duration-300 z-50 fixed inset-y-0 left-0 md:sticky md:top-0 ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'}`}>
      {/* Brand Header */}
      <div className={`p-4 sm:p-5 flex items-center ${isCollapsed ? 'md:justify-center justify-between' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">KI</div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-100 text-sm tracking-wide">e-Persuratan</span>
              <span className="text-[10px] text-slate-400">Arsip Pribadi</span>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex w-10 h-10 rounded bg-blue-500/20 text-blue-400 items-center justify-center font-bold shrink-0">KI</div>
            {/* On mobile when open, this block doesn't render because isCollapsed is false */}
          </>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors shrink-0 md:block hidden">
          <FaBars size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        
        {/* Menu UTAMA */}
        <div>
          {(!isCollapsed || window.innerWidth < 768) && <p className={`px-4 text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest ${isCollapsed ? 'md:hidden' : ''}`}>Utama</p>}
          <div className="space-y-1">
            <Link to="/" title="Dashboard" className={navItemClass(path === '/')}>
              <FaHome size={16} className="shrink-0" /> 
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Menu DATA */}
        <div>
          {(!isCollapsed || window.innerWidth < 768) && <p className={`px-4 text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest ${isCollapsed ? 'md:hidden' : ''}`}>Data</p>}
          <div className="space-y-1">
            <Link to="/persuratan" title="Persuratan" className={navItemClass(isActive('/persuratan'))}>
              <FaEnvelope size={16} className="shrink-0" /> 
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Persuratan</span>
            </Link>
            {isAdmin && (
              <Link to="/nomor-surat-kanim" title="Nomor Surat" className={navItemClass(path === '/nomor-surat-kanim')}>
                <FaFileAlt size={16} className="shrink-0" /> 
                <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Nomor Surat</span>
              </Link>
            )}
            {isSuperAdmin && (
              <Link to="/Pegawai" title="Data Pegawai" className={navItemClass(isActive('/Pegawai'))}>
                <FaUsers size={16} className="shrink-0" /> 
                <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Supplier (Pegawai)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Menu LPJ */}
        <div>
          {(!isCollapsed || window.innerWidth < 768) && <p className={`px-4 text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest ${isCollapsed ? 'md:hidden' : ''}`}>LPJ</p>}
          <div className="space-y-1">
            <Link to="/lpj" title="LPJ" className={navItemClass(isActive('/lpj'))}>
              <FaFolderOpen size={16} className="shrink-0" /> 
              <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>Berkas LPJ</span>
            </Link>
          </div>
        </div>

        {/* Menu PENGATURAN */}
        {(isSuperAdmin || isAdmin) && (
          <div>
            {(!isCollapsed || window.innerWidth < 768) && <p className={`px-4 text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest ${isCollapsed ? 'md:hidden' : ''}`}>Pengaturan</p>}
            <div className="space-y-1">
              {isSuperAdmin && (
                <Link to="/mak-setup" title="MAK Setup" className={navItemClass(path === '/mak-setup')}>
                  <FaSitemap size={16} className="shrink-0" /> 
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>MAK Setup</span>
                </Link>
              )}
              {(isSuperAdmin || isAdmin) && (
                <Link to="/mak-history" title="History MAK" className={navItemClass(path === '/mak-history')}>
                  <FaHistory size={16} className="shrink-0" /> 
                  <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>History MAK</span>
                </Link>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Dark Mode Slider Toggle */}
      <div className="px-4 mt-auto mb-4">
        <div className={`${isCollapsed ? 'md:hidden' : 'block'}`}>
          <div 
            onClick={toggleDark}
            className="w-full bg-slate-900/80 hover:bg-slate-900 rounded-full p-1 flex items-center cursor-pointer relative border border-slate-700/50 transition-colors shadow-inner"
          >
            {/* The sliding background indicator */}
            <div 
              className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-blue-500 rounded-full transition-transform duration-300 ease-out shadow-sm ${isDark ? 'translate-x-full' : 'translate-x-0'}`}
            ></div>
            
            <div className={`flex-1 flex items-center justify-center gap-2 py-1.5 z-10 transition-colors duration-300 ${!isDark ? 'text-white' : 'text-slate-400'}`}>
              <FaSun size={12} /> <span className="text-[10px] font-bold">Light</span>
            </div>
            
            <div className={`flex-1 flex items-center justify-center gap-2 py-1.5 z-10 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-400'}`}>
              <FaMoon size={12} /> <span className="text-[10px] font-bold">Dark</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={toggleDark}
          className={`w-full flex justify-center p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shadow-sm ${isCollapsed ? 'hidden md:flex' : 'hidden'}`}
        >
          {isDark ? <FaMoon size={16} /> : <FaSun size={16} />}
        </button>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm shrink-0">
            {(userData?.nama || currentUser?.email || 'U')[0].toUpperCase()}
          </div>
          <div className={`flex-1 min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
            <p className="text-xs font-bold text-slate-200 truncate">{userData?.nama || currentUser.email}</p>
            <p className="text-[10px] text-slate-500 truncate">{userRole || 'Pegawai'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className={`mt-4 w-full flex items-center justify-center gap-2 font-semibold text-xs text-slate-400 hover:text-white hover:bg-rose-500/10 p-2.5 rounded-lg transition-colors ${isCollapsed ? 'md:px-0' : ''}`}
        >
          <FaSignOutAlt size={14} />
          <span className={`${isCollapsed ? 'md:hidden' : ''}`}>Keluar Akun</span>
        </button>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, requireRole }) {
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  
  if (requireRole === 'Super Admin' && !isSuperAdmin) return <Navigate to="/" />;
  if (requireRole === 'Admin' && (!isAdmin && !isSuperAdmin)) return <Navigate to="/" />;
  
  return children;
}

function AppContent() {
  const { currentUser } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
        {currentUser && (
          <>
            {/* Mobile Overlay */}
            {!isSidebarCollapsed && (
              <div 
                className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsSidebarCollapsed(true)}
              />
            )}
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
          </>
        )}

        <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
          
          {/* Mobile Header (Only visible on small screens when logged in) */}
          {currentUser && (
            <header className="md:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-30 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 text-xs">KI</div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">e-Persuratan</span>
              </div>
              <button 
                onClick={() => setIsSidebarCollapsed(false)} 
                className="p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <FaBars size={18} />
              </button>
            </header>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/persuratan" element={
                <ProtectedRoute>
                  <Persuratan />
                </ProtectedRoute>
              } />

              <Route path="/persuratan/form/:suratId" element={
                <ProtectedRoute>
                  <SuratForm />
                </ProtectedRoute>
              } />

              <Route path="/lpj" element={
                <ProtectedRoute>
                  <LPJ />
                </ProtectedRoute>
              } />

              <Route path="/lpj/:packId" element={
                <ProtectedRoute>
                  <LPJ />
                </ProtectedRoute>
              } />

              <Route path="/mak-setup" element={
                <ProtectedRoute requireRole="Super Admin"><MakSetup /></ProtectedRoute>
              } />

              <Route path="/mak-history" element={
                <ProtectedRoute requireRole="Admin"><MakHistory /></ProtectedRoute>
              } />
              
              <Route path="/nomor-surat-kanim" element={
                <ProtectedRoute requireRole="Admin"><NomorSuratKanim /></ProtectedRoute>
              } />
              
              <Route path="/Pegawai" element={
                <ProtectedRoute requireRole="Super Admin"><Pegawai /></ProtectedRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <AppContent />
    </AuthProvider>
  );
}

export default App;
