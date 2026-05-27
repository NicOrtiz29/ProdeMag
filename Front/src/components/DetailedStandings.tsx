import React, { useState } from 'react';
import { StandingsEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Trophy } from 'lucide-react';

interface DetailedStandingsProps {
  standings: StandingsEntry[];
}

export default function DetailedStandings({ standings }: DetailedStandingsProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandings = standings.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (entry.role && entry.role.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedStandings = [...filteredStandings].sort((a, b) => b.points - a.points);

  // Top 3 for podium
  const podium = sortedStandings.slice(0, 3);
  const rest = sortedStandings.slice(3);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  const getPodiumStyle = (index: number) => {
    if (index === 0) return 'border-[#F4C430]/40 bg-[#F4C430]/5 shadow-[#F4C430]/10 shadow-lg';
    if (index === 1) return 'border-slate-400/30 bg-slate-500/5';
    if (index === 2) return 'border-amber-700/30 bg-amber-800/5';
    return '';
  };

  const renderAvatar = (avatar: string | undefined, size: string = 'w-12 h-12 text-2xl') => {
    if (avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.length > 8)) {
      return <img src={avatar} className={`${size} rounded-full object-cover select-none shrink-0`} alt="Avatar" />;
    }
    return <span className={`${size} flex items-center justify-center select-none shrink-0`}>{avatar || '⚽'}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F4C430]" /> Tabla de Posiciones
            </h2>
            <p className="text-sm text-slate-400 mt-1">Ranking general del Prode MagIA</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar participante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1a1a2e] border border-[#5B5FC7]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#3CDBC0]/50 w-full sm:w-56 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Podium - Top 3 */}
      {podium.length > 0 && !searchTerm && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {podium.map((entry, idx) => (
            <div
              key={entry.id}
              className={`glass rounded-2xl ${idx === 0 ? 'p-6' : 'p-5'} text-center border ${getPodiumStyle(idx)} transition-all`}
            >
              <div className={`text-${idx === 0 ? '4xl' : '3xl'} mb-2`}>{getMedalEmoji(idx)}</div>
              {renderAvatar(entry.avatar, idx === 0 ? 'w-18 h-18 text-4xl mx-auto' : 'w-14 h-14 text-3xl mx-auto')}
              <h3 className="font-bold text-white mt-2 text-sm truncate">{entry.name}</h3>
              <p className="text-xs text-slate-400 truncate">{entry.role || 'Participante'}</p>
              <div className={`mt-3 text-2xl font-extrabold ${idx === 0 ? 'gradient-text-mag' : 'text-slate-300'}`}>
                {entry.points}
              </div>
              <span className="text-xs text-slate-500">puntos</span>
            </div>
          ))}
        </div>
      )}

      {/* Remaining participants */}
      <div className="space-y-2">
        {(searchTerm ? sortedStandings : rest).map((entry, index) => {
          const position = searchTerm ? index + 1 : index + 4;
          const isCurrentUser = user?.id === entry.id;

          return (
            <div
              key={entry.id}
              className={`glass rounded-xl p-4 flex items-center gap-4 transition-all ${
                isCurrentUser ? 'border-[#3CDBC0]/30 bg-[#3CDBC0]/5' : ''
              } ${entry.isBot ? 'border-[#5B5FC7]/20 bg-[#5B5FC7]/5' : ''}`}
            >
              {/* Position */}
              <div className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-[#5B5FC7]/20 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                {position}
              </div>

              {/* Avatar */}
              {renderAvatar(entry.avatar, 'w-10 h-10 text-xl')}

              {/* Name & Role */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm truncate ${entry.isBot ? 'text-[#5B5FC7]' : isCurrentUser ? 'text-[#3CDBC0]' : 'text-white'}`}>
                    {entry.name}
                  </span>
                  {entry.isBot && (
                    <span className="text-[10px] font-semibold uppercase bg-[#5B5FC7]/10 text-[#5B5FC7] border border-[#5B5FC7]/20 px-1.5 py-0.5 rounded">
                      Bot
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="text-[10px] font-semibold uppercase bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/20 px-1.5 py-0.5 rounded">
                      Vos
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{entry.role || 'Participante'}</span>
              </div>

              {/* Province (hidden on small) */}
              <div className="hidden sm:block text-xs text-slate-400">
                {entry.province || ''}
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <span className={`text-lg font-extrabold ${entry.isBot ? 'text-[#5B5FC7]' : isCurrentUser ? 'text-[#3CDBC0]' : 'text-white'}`}>
                  {entry.points}
                </span>
                <span className="block text-[10px] text-slate-500">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {sortedStandings.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-slate-400">No se encontraron participantes.</p>
        </div>
      )}
    </div>
  );
}
