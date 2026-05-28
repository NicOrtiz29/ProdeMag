import './UserHeader.css';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface UserHeaderProps {
  onNavigate: () => void;
}

export default function UserHeader({ onNavigate }: UserHeaderProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4 px-4 py-2 bg-[#0b111a]/80 border-b border-[#5B5FC7]/20 header-animate">
      
      {/* Left section: Decorative ball & role badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl animate-spin-slow text-[#3CDBC0]">⚽</span>
        {user.role && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#3CDBC0]/20 text-[#3CDBC0]">{user.role}</span>
        )}
      </div>

      {/* Middle section: Profile quick-link (Avatar + Name) */}
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity py-1 px-3 rounded-full hover:bg-white/5" 
        onClick={onNavigate}
        title="Ver mi perfil"
      >
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-[#5B5FC7]/30 shrink-0">
          {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">{user.avatar || '⚽'}</span>
          )}
        </div>
        <span className="text-sm font-semibold text-white tracking-wide">{user.name || 'Usuario'}</span>
      </div>

      {/* Right section: Logout action button */}
      <div className="flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            logout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-white transition-all text-xs font-bold"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

    </div>
  );
}
