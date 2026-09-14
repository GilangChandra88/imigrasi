import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (email === 'bakmiekt@gmail.com' && password === '@Balibagus05') {
        // Magic bootstrap logic for Master Admin
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            await createUserWithEmailAndPassword(auth, email, password);
          } else throw err;
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      
      {/* Branding Section (Hidden on mobile, visible on md and up) */}
      <div className="hidden md:flex flex-1 bg-[#1e293b] flex-col justify-center items-center p-12 text-center relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center text-4xl font-extrabold mb-8 shadow-xl border border-blue-500/30">
            KI
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">e-Persuratan</h1>
          <p className="text-slate-400 text-lg lg:text-xl max-w-md leading-relaxed font-medium">
            Sistem Informasi Manajemen Persuratan & LPJ Kantor Imigrasi Kelas II TPI Buleleng
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-12 md:p-16 lg:p-24 relative min-h-screen md:min-h-0">
        
        {/* Mobile Header Branding (Only visible on small screens) */}
        <div className="absolute top-10 left-0 right-0 flex justify-center md:hidden">
          <div className="flex flex-col items-center gap-3">
             <div className="w-16 h-16 bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-sm border border-blue-500/20">
               KI
             </div>
             <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">e-Persuratan</h1>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-10 transition-colors mt-24 md:mt-0 relative z-10">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Masuk untuk mengelola arsip dan LPJ Anda.</p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium mb-6 border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
              <div className="w-1.5 h-full min-h-[24px] rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FaEnvelope size={16} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Masukkan email Anda"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FaLock size={16} />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Masukkan password Anda"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98] mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSignInAlt size={18} />
                  <span className="text-base tracking-wide">Masuk ke Dasbor</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
