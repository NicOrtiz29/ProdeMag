import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function OracleHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
      {/* Subtle Argentina stripe top */}
      <div className="absolute top-0 inset-x-0 h-1 flex">
        <div className="flex-1 bg-[#75AADB]" />
        <div className="w-1/6 bg-white" />
        <div className="flex-1 bg-[#75AADB]" />
      </div>

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-[#5B5FC7]/15 border border-[#5B5FC7]/30 flex items-center justify-center text-xl">
          ⚽
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Prode <span className="gradient-text-mag">MagIA</span>
          </h1>
          <p className="text-xs text-slate-400">Mundial 2026 — ⭐⭐⭐ 🇦🇷</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-sm font-semibold text-white">{user.name}</span>
            <span className="block text-xs text-slate-400">{user.role}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] border border-[#5B5FC7]/30 flex items-center justify-center text-lg overflow-hidden shrink-0">
            {user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http') || user.avatar.length > 8) ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              user.avatar || '⚽'
            )}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-[#1a1a2e] border border-[#5B5FC7]/20 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
