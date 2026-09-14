import React, { useState, useEffect } from 'react';
import { FaGlobeAmericas, FaPlane } from 'react-icons/fa';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increases by 2% every 30ms (approx 1.5 seconds to 100%)
      });
    }, 30);

    // Trigger fade out after progress completes
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Unmount component
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2300); // 500ms for fade out transition

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Decorative Blur Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-[30rem] h-[30rem] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
      </div>
      
      {/* Animation Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Globe and Plane Animation */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          {/* Globe rotating slowly */}
          <div className="absolute inset-0 flex items-center justify-center text-blue-500/80 animate-[spin_8s_linear_infinite]">
            <FaGlobeAmericas size={80} />
          </div>
          
          {/* Plane flying around the globe */}
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-white transform rotate-[90deg] drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              <FaPlane size={28} />
            </div>
            {/* Plane Trail */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[2px] h-12 bg-gradient-to-t from-transparent to-white/50 blur-[1px]"></div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center transform transition-all duration-1000 translate-y-0 opacity-100">
           <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase mb-3 drop-shadow-md">
             e-Persuratan
           </h1>
           <p className="text-blue-400 text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold">
             Kantor Imigrasi Buleleng
           </p>
        </div>
        
        {/* Loading Bar */}
        <div className="w-56 h-1.5 bg-slate-800 rounded-full mt-12 overflow-hidden relative shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all ease-out"
            style={{ width: `${progress}%`, transitionDuration: '30ms' }}
          >
            {/* Glow effect on the tip of the progress bar */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-80"></div>
          </div>
        </div>
        <p className="text-slate-500 text-[10px] mt-3 font-medium uppercase tracking-wider animate-pulse">
          Memuat Sistem...
        </p>

      </div>
    </div>
  );
}
