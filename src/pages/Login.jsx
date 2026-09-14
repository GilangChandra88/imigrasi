import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaFileSignature } from 'react-icons/fa';

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
      window.dispatchEvent(new Event('triggerSplash'));
    } catch (err) {
      console.error(err);
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      
      {/* Keyframes for Hologram Animation */}
      <style>{`
        .hologram-float {
          animation: float 4s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateX(15deg) rotateY(-15deg); filter: drop-shadow(0 0 15px rgba(99,102,241,0.4)); }
          50% { transform: translateY(-20px) rotateX(25deg) rotateY(-5deg); filter: drop-shadow(0 0 30px rgba(99,102,241,0.8)); }
        }
        .scanline {
          width: 100%;
          height: 3px;
          background: rgba(99,102,241, 0.9);
          position: absolute;
          animation: scan 2s linear infinite;
          box-shadow: 0 0 15px rgba(99,102,241, 1);
          z-index: 50;
        }
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Branding Section (Hidden on mobile, visible on md and up) */}
      <div className="hidden md:flex flex-1 bg-[#020617] flex-col justify-center items-center p-12 text-center relative overflow-hidden">
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[length:40px_40px] opacity-30"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center mt-[-40px]">
          
          {/* Hologram Document Animation (matching Splash Screen but Indigo tinted) */}
          <div className="relative flex items-center justify-center mb-12 hologram-float scale-90">
            <div className="absolute inset-[-10%] z-20 overflow-hidden rounded-2xl pointer-events-none">
               <div className="scanline"></div>
            </div>
            <div className="relative bg-slate-900/60 backdrop-blur-md border-2 border-indigo-400/60 p-8 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center">
               <FaLock className="text-indigo-400 text-7xl opacity-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
               <div className="w-20 h-1.5 bg-indigo-400/50 mt-5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
               <div className="w-14 h-1.5 bg-indigo-400/50 mt-2.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400 tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            e-Persuratan
          </h1>
          <p className="text-indigo-300 text-sm lg:text-base tracking-[0.2em] max-w-md leading-relaxed font-semibold uppercase opacity-80">
            Portal Autentikasi Imigrasi
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-12 md:p-16 lg:p-24 relative min-h-screen md:min-h-0 bg-slate-50 dark:bg-slate-950">
        
        {/* Mobile Header Branding */}
        <div className="absolute top-10 left-0 right-0 flex justify-center md:hidden fade-in-up">
          <div className="flex flex-col items-center gap-3">
             <div className="w-16 h-16 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30">
               <FaLock />
             </div>
             <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-widest uppercase">Otorisasi</h1>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-10 mt-24 md:mt-0 relative z-10 fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Masuk untuk mengakses sistem e-Persuratan & LPJ.</p>
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <FaEnvelope size={16} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Masukkan email kredensial"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <FaLock size={16} />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Masukkan kata sandi rahasia"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSignInAlt size={18} />
                  <span className="text-base tracking-wide uppercase">Otorisasi Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
