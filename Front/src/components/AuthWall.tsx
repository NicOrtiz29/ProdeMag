import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AuthWall() {
  const { loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    const res = await loginWithGoogle();
    if (!res.success) {
      setErrorMessage('Google Auth no está habilitado aún. Pedile al admin que lo configure en Supabase (Authentication > Providers > Google).');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans text-slate-100">
      
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/argentina-campeon-2026.png" alt="Fondo Campeones" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23]/90 via-[#0f0f23]/70 to-[#0f0f23]/90" />
      </div>

      {/* Argentina stripe top bar */}
      <div className="absolute top-0 inset-x-0 h-2 flex z-10">
        <div className="flex-1 bg-[#75AADB]" />
        <div className="w-1/5 bg-white" />
        <div className="flex-1 bg-[#75AADB]" />
        <div className="w-1/5 bg-white" />
        <div className="flex-1 bg-[#75AADB]" />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#5B5FC7]/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#3CDBC0]/8 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-4">
            <span className="text-lg drop-shadow-[0_2px_5px_rgba(244,196,48,0.5)]">⭐</span>
            <span className="text-2xl drop-shadow-[0_2px_8px_rgba(244,196,48,0.7)] -mt-1">⭐</span>
            <span className="text-lg drop-shadow-[0_2px_5px_rgba(244,196,48,0.5)]">⭐</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5B5FC7]/10 border border-[#5B5FC7]/30 text-[#3CDBC0] text-xs font-bold uppercase tracking-widest mb-5">
            🏆 Mundial 2026
          </div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
            Prode <span className="gradient-text-mag">MagIA</span>
          </h1>
          <p className="text-slate-400 invisible select-none pointer-events-none">Inicia sesión con tu cuenta de Google para competir.</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl transition-all">
          <div className="space-y-6">
            
            {/* Error message */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google icon decorative */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-8 h-8" alt="Google" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Acceso con Google</h2>
              <p className="text-xs text-slate-400">Usá tu cuenta de Google corporativa o personal para ingresar al Prode.</p>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              {isLoading ? 'Redirigiendo a Google...' : 'Continuar con Google'}
            </button>

            {/* Security note */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              🔒 Autenticación segura vía Google OAuth 2.0. No almacenamos contraseñas.
            </p>
          </div>
        </div>

        {/* Magnetico branding footer */}
        <div className="mt-8 text-center">
          <span className="text-xs text-slate-600">Hecho con 💜 por</span>
          <span className="text-xs font-bold text-[#5B5FC7] ml-1">MAG</span>
          <span className="text-xs font-bold text-[#3CDBC0]">~</span>
        </div>
      </div>
    </div>
  );
}
