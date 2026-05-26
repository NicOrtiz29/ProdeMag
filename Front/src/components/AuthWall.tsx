import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, CheckCircle, Info, Eye, EyeOff } from 'lucide-react';

export default function AuthWall() {
  const { login, loginWithGoogle, recoverPassword } = useAuth();
  const [isRecoverMode, setIsRecoverMode] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [isSendingRecovery, setIsSendingRecovery] = useState<boolean>(false);
  const [recoverySuccessMessage, setRecoverySuccessMessage] = useState<string>('');
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setRecoverySuccessMessage('');

    const emailTrimmed = recoveryEmail.toLowerCase().trim();
    if (!emailTrimmed.includes('@')) {
      setErrorMessage('Por favor introduce un correo electrónico válido.');
      return;
    }

    setIsSendingRecovery(true);
    const res = await recoverPassword(emailTrimmed);
    setIsSendingRecovery(false);

    if (res.success) {
      setRecoverySuccessMessage(`¡El correo de recuperación se ha enviado a ${emailTrimmed}!`);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    const res = await loginWithGoogle();
    if (!res.success) {
      setErrorMessage('Google Auth no está habilitado aún. Pedile al admin que lo configure en Supabase (Authentication > Providers > Google).');
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
          <p className="text-slate-400">Inicia sesión para competir con tu equipo.</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl transition-all">
          
          {isRecoverMode ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Recuperar contraseña</h2>
              <p className="text-sm text-slate-400 mb-6">Ingresa tu correo para recibir un enlace seguro de recuperación.</p>
              
              <form onSubmit={handleRecoverPassword} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {recoverySuccessMessage && (
                  <div className="bg-[#3CDBC0]/10 border border-[#3CDBC0]/30 p-3 rounded-xl flex items-center gap-2 text-[#3CDBC0] text-sm">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{recoverySuccessMessage}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#5B5FC7]/20 hover:border-[#5B5FC7]/40 focus:border-[#3CDBC0] rounded-xl text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingRecovery}
                  className="w-full py-3 mt-4 gradient-btn text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isSendingRecovery ? 'Procesando...' : 'Enviar Correo'}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsRecoverMode(false); setErrorMessage(''); setRecoverySuccessMessage(''); }}
                  className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors mt-2"
                >
                  ← Volver al inicio de sesión
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continuar con Google
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-[#5B5FC7]/20"></div>
                <span className="text-slate-500 text-sm font-medium">o con correo</span>
                <div className="flex-1 h-px bg-[#5B5FC7]/20"></div>
              </div>

              <form onSubmit={handleAuthAction} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@magnetico.dev"
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-[#5B5FC7]/20 hover:border-[#5B5FC7]/40 focus:border-[#3CDBC0] rounded-xl text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-300">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoverMode(true);
                        setRecoveryEmail(email);
                        setErrorMessage('');
                      }}
                      className="text-xs text-[#3CDBC0] hover:text-[#3CDBC0]/80"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-[#1a1a2e] border border-[#5B5FC7]/20 hover:border-[#5B5FC7]/40 focus:border-[#3CDBC0] rounded-xl text-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 gradient-btn text-white font-bold rounded-xl shadow-lg shadow-[#5B5FC7]/20 transition-all hover:shadow-[#5B5FC7]/30 active:scale-[0.99]"
                >
                  Iniciar Sesión
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-2 text-sm text-slate-400">
          <Info className="w-4 h-4" /> 
          Demo: <strong className="text-slate-300">nicolaso@magnetico.dev</strong> / <strong className="text-slate-300">Abcd1234!</strong>
        </div>

        {/* Magnetico branding footer */}
        <div className="mt-6 text-center">
          <span className="text-xs text-slate-600">Hecho con 💜 por</span>
          <span className="text-xs font-bold text-[#5B5FC7] ml-1">MAG</span>
          <span className="text-xs font-bold text-[#3CDBC0]">~</span>
        </div>
      </div>
    </div>
  );
}
