import React, { useState } from 'react';
import { StandingsEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Trophy, Crown, Medal, ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface DetailedStandingsProps {
  standings: StandingsEntry[];
}

// Simulated players to fill the ranking when there are fewer than 8 real users
const SIMULATED_PLAYERS: StandingsEntry[] = [
  { id: 'sim-1', name: 'Lucas Martínez', points: 18, isBot: false, avatar: '🧑‍💻', role: 'Desarrollo', province: 'Buenos Aires' },
  { id: 'sim-2', name: 'Valentina Ruiz', points: 15, isBot: false, avatar: '👩‍🎨', role: 'Diseño', province: 'Córdoba' },
  { id: 'sim-3', name: 'Mateo García', points: 14, isBot: false, avatar: '🧔', role: 'Data', province: 'Mendoza' },
  { id: 'sim-4', name: 'Camila López', points: 12, isBot: false, avatar: '👩‍💼', role: 'Marketing', province: 'Santa Fe' },
  { id: 'sim-5', name: 'Tomás Fernández', points: 11, isBot: false, avatar: '🧑‍🔬', role: 'QA', province: 'Tucumán' },
  { id: 'sim-6', name: 'Sofía Romero', points: 9, isBot: false, avatar: '👩‍🚀', role: 'Producto', province: 'Neuquén' },
  { id: 'sim-7', name: 'Joaquín Díaz', points: 7, isBot: false, avatar: '🧑‍🏫', role: 'Soporte', province: 'Salta' },
  { id: 'sim-8', name: 'Martina Gómez', points: 5, isBot: false, avatar: '👩‍⚕️', role: 'RRHH', province: 'Entre Ríos' },
];

export default function DetailedStandings({ standings }: DetailedStandingsProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Merge real standings with simulated ones (avoid duplicates by id)
  const realIds = new Set(standings.map(s => s.id));
  const simulatedToAdd = SIMULATED_PLAYERS.filter(s => !realIds.has(s.id));
  const mergedStandings = [...standings, ...simulatedToAdd];

  const filteredStandings = mergedStandings.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (entry.role && entry.role.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedStandings = [...filteredStandings].sort((a, b) => b.points - a.points);

  // Top 3 for podium cards
  const podium = sortedStandings.slice(0, 3);
  const rest = sortedStandings.slice(3);

  const renderAvatar = (avatar: string | undefined, size: string = 'w-12 h-12 text-2xl') => {
    if (avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.length > 8)) {
      return <img src={avatar} className={`${size} rounded-full object-cover select-none shrink-0 ring-2 ring-white/10`} alt="Avatar" />;
    }
    return <span className={`${size} flex items-center justify-center select-none shrink-0`}>{avatar || '⚽'}</span>;
  };

  const getTrendIcon = (pos: number) => {
    // Simulated trend — in a real app this would compare to previous positions
    if (pos <= 2) return <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />;
    if (pos >= 6) return <ChevronDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-500" />;
  };

  /* ──────────────────── PODIUM CARD (top 3) ──────────────────── */
  const renderPodiumCard = (entry: StandingsEntry, position: number) => {
    const isFirst = position === 1;
    const isSecond = position === 2;
    const isCurrentUser = user?.id === entry.id;
    const isSimulated = entry.id.startsWith('sim-');

    // Visual configs per position
    const config = {
      1: {
        border: 'border-[#F4C430]/50',
        bg: 'bg-gradient-to-b from-[#F4C430]/15 via-[#F4C430]/5 to-transparent',
        glow: 'shadow-[0_0_40px_rgba(244,196,48,0.15)]',
        medal: '🥇',
        medalBg: 'bg-gradient-to-br from-[#F4C430] to-[#DAA520]',
        avatarSize: 'w-20 h-20 text-5xl',
        avatarRing: 'ring-[#F4C430]/60 ring-4',
        pointsColor: 'gradient-text-mag',
        pointsSize: 'text-4xl',
        nameSize: 'text-base',
        height: 'min-h-[280px]',
        order: 'order-2',
      },
      2: {
        border: 'border-slate-400/30',
        bg: 'bg-gradient-to-b from-slate-400/10 via-slate-400/5 to-transparent',
        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.08)]',
        medal: '🥈',
        medalBg: 'bg-gradient-to-br from-slate-300 to-slate-500',
        avatarSize: 'w-16 h-16 text-4xl',
        avatarRing: 'ring-slate-400/40 ring-3',
        pointsColor: 'text-slate-200',
        pointsSize: 'text-3xl',
        nameSize: 'text-sm',
        height: 'min-h-[250px]',
        order: 'order-1',
      },
      3: {
        border: 'border-amber-700/30',
        bg: 'bg-gradient-to-b from-amber-700/10 via-amber-800/5 to-transparent',
        glow: 'shadow-[0_0_20px_rgba(180,83,9,0.08)]',
        medal: '🥉',
        medalBg: 'bg-gradient-to-br from-amber-600 to-amber-800',
        avatarSize: 'w-16 h-16 text-4xl',
        avatarRing: 'ring-amber-700/40 ring-3',
        pointsColor: 'text-amber-200',
        pointsSize: 'text-3xl',
        nameSize: 'text-sm',
        height: 'min-h-[250px]',
        order: 'order-3',
      },
    }[position]!;

    return (
      <div
        key={entry.id}
        className={`${config.order} relative glass rounded-2xl border ${config.border} ${config.bg} ${config.glow} ${config.height} flex flex-col items-center justify-center p-5 transition-all duration-500 hover:scale-[1.03] hover:shadow-xl group`}
      >
        {/* Shimmer effect for 1st place */}
        {isFirst && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 shimmer opacity-60" />
          </div>
        )}

        {/* Position badge */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${config.medalBg} w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg z-10`}>
          {position}
        </div>

        {/* Medal emoji */}
        <div className={`${isFirst ? 'text-5xl' : 'text-4xl'} mb-3 group-hover:scale-110 transition-transform duration-300`}>
          {config.medal}
        </div>

        {/* Avatar */}
        <div className={`relative mb-3`}>
          {renderAvatar(entry.avatar, `${config.avatarSize} ${config.avatarRing} rounded-full`)}
          {isFirst && (
            <Crown className="absolute -top-3 -right-2 w-5 h-5 text-[#F4C430] drop-shadow-lg" />
          )}
        </div>

        {/* Name */}
        <h3 className={`${config.nameSize} font-bold text-white text-center truncate max-w-full px-2`}>
          {entry.name}
          {isCurrentUser && (
            <span className="ml-1.5 text-[10px] font-semibold uppercase bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/20 px-1.5 py-0.5 rounded align-middle">
              Vos
            </span>
          )}
        </h3>

        {/* Role */}
        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full px-2">{entry.role || 'Participante'}</p>

        {/* Points */}
        <div className={`mt-4 ${config.pointsSize} font-extrabold ${config.pointsColor} tracking-tight`}>
          {entry.points}
        </div>
        <span className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">puntos</span>

        {/* Simulated badge */}
        {isSimulated && (
          <span className="absolute top-2 right-2 text-[8px] font-bold uppercase bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded">
            Demo
          </span>
        )}
      </div>
    );
  };

  /* ──────────────────── TABLE ROW (4th+) ──────────────────── */
  const renderTableRow = (entry: StandingsEntry, index: number) => {
    const position = searchTerm ? index + 1 : index + 4;
    const isCurrentUser = user?.id === entry.id;
    const isSimulated = entry.id.startsWith('sim-');

    return (
      <tr
        key={entry.id}
        className={`group transition-all duration-200 hover:bg-white/[0.03] ${
          isCurrentUser ? 'bg-[#3CDBC0]/[0.04]' : ''
        }`}
      >
        {/* Position */}
        <td className="py-3 pl-4 pr-2 w-12">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            isCurrentUser
              ? 'bg-[#3CDBC0]/15 text-[#3CDBC0] border border-[#3CDBC0]/20'
              : 'bg-[#1a1a2e] text-slate-400 border border-[#5B5FC7]/10'
          }`}>
            {position}
          </div>
        </td>

        {/* Trend */}
        <td className="py-3 px-1 w-8 hidden sm:table-cell">
          {getTrendIcon(position)}
        </td>

        {/* Avatar + Name */}
        <td className="py-3 px-2">
          <div className="flex items-center gap-3">
            {renderAvatar(entry.avatar, 'w-9 h-9 text-lg')}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold text-sm truncate ${
                  isCurrentUser ? 'text-[#3CDBC0]' : 'text-white'
                }`}>
                  {entry.name}
                </span>
                {isCurrentUser && (
                  <span className="text-[9px] font-bold uppercase bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/20 px-1 py-px rounded shrink-0">
                    Vos
                  </span>
                )}
                {entry.isBot && (
                  <span className="text-[9px] font-bold uppercase bg-[#5B5FC7]/10 text-[#5B5FC7] border border-[#5B5FC7]/20 px-1 py-px rounded shrink-0">
                    Bot
                  </span>
                )}
                {isSimulated && (
                  <span className="text-[8px] font-bold uppercase bg-slate-700/50 text-slate-500 px-1 py-px rounded shrink-0">
                    Demo
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 block truncate">{entry.role || 'Participante'}</span>
            </div>
          </div>
        </td>

        {/* Province (hidden on mobile) */}
        <td className="py-3 px-2 hidden md:table-cell">
          <span className="text-xs text-slate-400">{entry.province || '—'}</span>
        </td>

        {/* Points */}
        <td className="py-3 pl-2 pr-4 text-right">
          <span className={`text-lg font-extrabold tabular-nums ${
            isCurrentUser ? 'text-[#3CDBC0]' : 'text-white'
          }`}>
            {entry.points}
          </span>
          <span className="block text-[9px] text-slate-500 uppercase tracking-wider">pts</span>
        </td>
      </tr>
    );
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

      {/* ═══════════ PODIUM — Top 3 ═══════════ */}
      {podium.length >= 3 && !searchTerm && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end px-1">
          {podium.map((entry, idx) => renderPodiumCard(entry, idx + 1))}
        </div>
      )}
      {/* Fallback: if < 3, show them as cards in a row anyway */}
      {podium.length > 0 && podium.length < 3 && !searchTerm && (
        <div className={`grid grid-cols-${podium.length} gap-3 sm:gap-4 items-end px-1`}>
          {podium.map((entry, idx) => renderPodiumCard(entry, idx + 1))}
        </div>
      )}

      {/* ═══════════ TABLE — 4th and below ═══════════ */}
      {(searchTerm ? sortedStandings : rest).length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="px-4 py-3 border-b border-[#5B5FC7]/10 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {searchTerm ? 'Resultados' : 'Clasificación general'}
            </span>
            <span className="text-[10px] text-slate-600 ml-auto">
              {(searchTerm ? sortedStandings : rest).length} participantes
            </span>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#5B5FC7]/10">
                <th className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold py-2.5 pl-4 pr-2 text-left w-12">#</th>
                <th className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold py-2.5 px-1 text-left w-8 hidden sm:table-cell"></th>
                <th className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold py-2.5 px-2 text-left">Jugador</th>
                <th className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold py-2.5 px-2 text-left hidden md:table-cell">Provincia</th>
                <th className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold py-2.5 pl-2 pr-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5B5FC7]/5">
              {(searchTerm ? sortedStandings : rest).map((entry, index) =>
                renderTableRow(entry, index)
              )}
            </tbody>
          </table>
        </div>
      )}

      {sortedStandings.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No se encontraron participantes.</p>
        </div>
      )}
    </div>
  );
}
