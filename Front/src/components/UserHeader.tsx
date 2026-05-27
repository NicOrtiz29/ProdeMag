import './UserHeader.css';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

interface UserHeaderProps {
  onNavigate: () => void;
}

export default function UserHeader({ onNavigate }: UserHeaderProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4 px-4 py-2 bg-[#0b111a]/80 border-b border-[#5B5FC7]/20 cursor-pointer hover:bg-[#0b111a]/90 transition-colors header-animate" onClick={onNavigate}>
      {/* Left decorative element */}
      <div className="flex items-center gap-2">
        <span className="text-2xl animate-spin-slow text-[#3CDBC0]">⚽</span>
        {user.role && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#3CDBC0]/20 text-[#3CDBC0]">{user.role}</span>
        )}
      </div>
      {/* Right user info */}
      {user.avatar ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
            {user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">{user.avatar}</span>
            )}
          </div>
          <span className="text-sm font-medium text-white">{user.name || 'Usuario'}</span>
        </div>
      ) : (
        <User className="w-6 h-6 text-[#3CDBC0]" />
      )}
    </div>
  );
}
