/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match } from '../types';
import { User, Award, ShieldAlert, Sparkles, UserCheck, LogOut, Check, Save, Target, CheckSquare } from 'lucide-react';

interface UserProfilePanelProps {
  matches: Match[];
}

const AVATARS_POOL = ['🚀', '⚽', '🎨', '💻', '🧠', '👑', '📈', '🧤', '🔥', '🏆', '🧙‍♂️', '⚡'];
const ROLES_POOL = [
  'Tech Lead',
  'Analista Funcional',
  'Senior Frontend Dev',
  'Backend Engineer',
  'QA Automation Lead',
  'Product Owner',
  'UX/UI Designer',
  'SysOps Administrador',
  'Recursos Humanos'
];

export default function UserProfilePanel({ matches }: UserProfilePanelProps) {
  const { user, updateUser, logout } = useAuth();

  const [editName, setEditName] = useState<string>(user?.name || '');
  const [editRole, setEditRole] = useState<string>(user?.role || '');
  const [editAvatar, setEditAvatar] = useState<string>(user?.avatar || '🚀');
  const [editBio, setEditBio] = useState<string>(user?.bio || '');

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="bg-slate-900/40 p-12 text-center rounded-2xl border border-slate-800 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
        <p className="text-sm font-semibold text-white">No has iniciado sesión correctamente.</p>
      </div>
    );
  }

  // Count matches predicted by comparing prediction with anything (always predicted by default, but we can see if they changed any scores)
  const totalMatchesCount = matches.length;
  // Let's count how many we have modified from [0, 0] or original default
  const nonZeroPredictions = matches.filter(m => m.prediction[0] !== 0 || m.prediction[1] !== 0).length;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    if (!editName.trim()) return;

    updateUser({
      name: editName.trim(),
      role: editRole,
      avatar: editAvatar,
      bio: editBio.trim()
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left side: Interactive Edit Form (lg:col-span-8) */}
      <div className="lg:col-span-8 bg-[#0b111a]/85 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Absolute top decorative corner highlight */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Header header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-850 gap-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display font-black text-base text-white">Editar mi Perfil del Prode</h2>
              <p className="text-3xs text-slate-400 font-mono uppercase tracking-tight">Personaliza tus credenciales y estado folclórico en vivo</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-950/10 text-xs text-red-400 hover:text-red-300 transition-all cursor-pointer font-bold font-mono shadow-md self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión Prode
          </button>
        </div>

        {/* Action Form */}
        <form onSubmit={handleProfileSave} className="space-y-5">
          
          {/* Dynamic saving notification */}
          {saveSuccess && (
            <div className="bg-emerald-950/20 border border-emerald-500/25 p-3.5 rounded-xl flex items-center gap-2 text-emerald-300 text-2xs font-mono animate-fade-in shadow-inner">
              <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>¡Perfil guardado correctamente! Tus datos fueron actualizados en los leaderboards del sistema.</span>
            </div>
          )}

          {/* User Details split row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                Nombre de Usuario o Nickname
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Por favor introduce un nombre descriptivo..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-white focus:outline-none transition-all font-sans font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                Puesto Laboral / Rol Corporativo
              </label>
              <select
                value={editRole || 'Senior Frontend Dev'}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-slate-200 focus:outline-none transition-all font-sans cursor-pointer"
              >
                {ROLES_POOL.map((r) => (
                  <option key={r} value={r} className="bg-slate-950 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Avatar selector slider box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                Cambiar tu Avatar de Líderes
              </label>
              <span className="text-[8px] uppercase font-mono tracking-wider text-sky-400 font-bold">¡O canchereá con foto propia!</span>
            </div>
            <div className="flex flex-wrap gap-2.5 bg-slate-950/40 border border-slate-850 p-3 rounded-2xl shadow-inner">
              {AVATARS_POOL.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setEditAvatar(av)}
                  className={`w-9.5 h-9.5 flex items-center justify-center text-xl rounded-xl hover:bg-slate-900 transition-all cursor-pointer ${
                    editAvatar === av 
                      ? 'bg-cyan-500/15 border border-cyan-500/40 scale-110 shadow-md' 
                      : 'border border-transparent'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            {/* PC File Upload integration for custom stadium avatar */}
            <div className="mt-2">
              <label className="relative overflow-hidden flex items-center justify-center gap-2 border-2 border-dashed border-sky-400/40 hover:border-sky-300 bg-sky-950/20 hover:bg-sky-900/35 px-4 py-3.5 rounded-xl text-3xs font-black uppercase text-sky-300 font-mono tracking-widest cursor-pointer transition-all active:scale-[0.98] select-none text-center">
                <span>📁 SUBIR NUEVO AVATAR DESDE LA PC 🇦🇷</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) {
                          setEditAvatar(reader.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Status Bio Text */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Tu Estado Narrativo (Bio folclórica de cancha)
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Ej. 'No compilo con bugs pero juego el prode a matar o morir... ¡Cuidado con el bache predictivo!'"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-white focus:outline-none transition-all leading-relaxed font-sans resize-none"
            />
          </div>

          {/* Locked fields display info */}
          <div className="bg-[#070c14] border border-slate-900 rounded-xl p-3.5 space-y-1 text-3xs font-mono text-slate-500 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-slate-400">
              🔒 DATOS DE CUENTA INALTERABLES
            </div>
            <div>
              <span className="text-slate-400 font-bold">Correo electrónico registrado: </span>
              <span className="text-slate-350">{user.email}</span>
            </div>
            <p>La dirección de mail asociada a tu cuenta local provee la clave primaria exclusiva en nuestra base de datos simulada y no puede ser modificada.</p>
          </div>

          {/* Submit Save profile */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 font-display text-xs font-black text-white rounded-xl shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios de Perfil
          </button>

        </form>

      </div>

      {/* Right side: User card visual status & dynamic simulator info (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* High-fidelity leaderboards styled preview card container */}
        <div className="bg-[#0b111a]/85 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl text-center">
          
          <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest text-left">
            Tarjeta de Líder
          </h3>

          {/* Big graphical Avatar & Details view */}
          <div className="space-y-2 py-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#0f172a] to-cyan-950/40 border border-slate-850 rounded-2xl flex items-center justify-center text-4xl select-none mx-auto shadow-xl ring-2 ring-cyan-500/15 animate-pulse overflow-hidden">
              {editAvatar && (editAvatar.startsWith('data:image/') || editAvatar.startsWith('http') || editAvatar.length > 8) ? (
                <img src={editAvatar} className="w-full h-full object-cover" alt="Custom Avatar" />
              ) : (
                editAvatar
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="font-display font-black text-white text-base truncate">
                {editName || 'Tu Nickname'}
              </h4>
              <p className="text-3xs text-cyan-400 font-mono font-bold tracking-tight uppercase">
                {editRole}
              </p>
            </div>
          </div>

          {/* Visual statistics dashboard boxes */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 text-center text-3xs font-mono">
            <div className="py-1">
              <span className="text-[8px] text-slate-500 uppercase block">Puntos</span>
              <span className="font-display text-base font-black text-slate-100">{user.points || 15}</span>
            </div>
            <div className="border-x border-slate-900 py-1">
              <span className="text-[8px] text-slate-500 uppercase block">Aciertos</span>
              <span className="font-display text-base font-black text-emerald-400">{user.accuracy || 85}%</span>
            </div>
            <div className="py-1">
              <span className="text-[8px] text-slate-500 uppercase block">Racha</span>
              <span className="font-display text-base font-black text-amber-500">+{user.streak || 3} 🔥</span>
            </div>
          </div>

          {/* Quick quote block */}
          <div className="bg-[#0c1320]/60 p-3 rounded-lg border border-[#162235]/30 text-3xs italic text-slate-350 min-h-[50px] flex items-center justify-center leading-relaxed">
            "{editBio || 'Sin estado folclórico definido. ¡Agrégale un toque gracioso en el formulario!'}"
          </div>

        </div>

        {/* Dynamic game counts info card */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <h4 className="font-display font-medium text-xs text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Target className="w-4 h-4 text-cyan-400" /> Rendimiento de tu Prode
          </h4>

          <div className="space-y-2 font-mono text-[10px] leading-relaxed text-slate-350">
            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span className="text-slate-450">Partidos con Goles editados:</span>
              <strong className="text-white">{nonZeroPredictions} / {totalMatchesCount}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span className="text-slate-450">Rival competitivo directo:</span>
              <strong className="text-amber-500">Flor (Commercial)</strong>
            </div>

            <div className="flex justify-between pb-1">
              <span className="text-slate-450">Posición estimada:</span>
              <strong className="text-cyan-400">Puntero Absoluto 🥇</strong>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-3 text-3xs text-slate-500 leading-relaxed text-center font-sans">
            A medida que realizas cambios en el Tab de <strong className="text-slate-400 font-medium">"Pronósticos"</strong> el simulador acumula dinámicamente tu asertividad.
          </div>
        </div>

      </div>

    </div>
  );
}
