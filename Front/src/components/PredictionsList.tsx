import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Match } from '../types';

const getFlag = (teamName: string, defaultFlag: string): string => {
  if (defaultFlag && defaultFlag.trim() !== '') return defaultFlag;
  const name = teamName ? teamName.trim() : '';
  const flags: Record<string, string> = {
    'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
    'Belgium': '🇧🇪', 'Bosnia & Herzegovina': '🇧🇦', 'Brazil': '🇧🇷', 'Canada': '🇨🇦',
    'Cape Verde': '🇨🇻', 'Colombia': '🇨🇴', 'Croatia': '🇭🇷', 'Curaçao': '🇨🇼',
    'Czech Republic': '🇨🇿', 'DR Congo': '🇨🇩', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Ghana': '🇬🇭',
    'Haiti': '🇭🇹', 'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ivory Coast': '🇨🇮',
    'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Mexico': '🇲🇽', 'Morocco': '🇲🇦',
    'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Norway': '🇳🇴', 'Panama': '🇵🇦',
    'Paraguay': '🇵🇾', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Senegal': '🇸🇳', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷',
    'Spain': '🇪🇸', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Tunisia': '🇹🇳',
    'Turkey': '🇹🇷', 'USA': '🇺🇸', 'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿'
  };
  return flags[name] || '⚽';
};

interface PredictionsListProps {
  matches: Match[];
  officialResults?: Record<string, [number, number]>;
  isEditingOfficial?: boolean;
  onChangeScore: (id: string, index: 0 | 1, value: number) => void;
  onResetMatches: () => void;
}

const getMatchJornada = (f: number): number => {
  if (f <= 72) {
    const groupMatchIndex = ((f - 1) % 6) + 1;
    if (groupMatchIndex <= 2) return 1;
    if (groupMatchIndex <= 4) return 2;
    return 3;
  }
  if (f <= 88) return 4; // R32
  if (f <= 96) return 5; // R16
  if (f <= 100) return 6; // QF
  if (f <= 102) return 7; // SF
  if (f <= 103) return 8; // Third Place
  return 9; // Final
};

const getJornadaLabel = (j: number): string => {
  if (j === 1) return 'Fecha 1';
  if (j === 2) return 'Fecha 2';
  if (j === 3) return 'Fecha 3';
  if (j === 4) return '16avos de Final';
  if (j === 5) return 'Octavos de Final';
  if (j === 6) return 'Cuartos de Final';
  if (j === 7) return 'Semifinales';
  if (j === 8) return 'Tercer Puesto';
  return 'Final';
};

const getMatchCalendarDate = (fechaNum: number): string => {
  if (fechaNum <= 72) {
    let day = 11;
    if (fechaNum <= 2) day = 11;
    else if (fechaNum <= 5) day = 12;
    else if (fechaNum <= 9) day = 13;
    else if (fechaNum <= 13) day = 14;
    else if (fechaNum <= 17) day = 15;
    else if (fechaNum <= 21) day = 16;
    else if (fechaNum <= 25) day = 17;
    else if (fechaNum <= 29) day = 18;
    else if (fechaNum <= 33) day = 19;
    else if (fechaNum <= 37) day = 20;
    else if (fechaNum <= 41) day = 21;
    else if (fechaNum <= 45) day = 22;
    else if (fechaNum <= 49) day = 23;
    else if (fechaNum <= 53) day = 24;
    else if (fechaNum <= 57) day = 25;
    else if (fechaNum <= 61) day = 26;
    else day = 27;

    const dateObj = new Date(2026, 5, day);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dayNames[dateObj.getDay()]} ${day}/${6}`;
  }
  
  if (fechaNum <= 88) {
    const day = 28 + Math.floor((fechaNum - 73) / 2.7);
    if (day <= 30) {
      const dateObj = new Date(2026, 5, day);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${dayNames[dateObj.getDay()]} ${day}/${6}`;
    } else {
      const julyDay = day - 30;
      const dateObj = new Date(2026, 6, julyDay);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${dayNames[dateObj.getDay()]} ${julyDay}/${7}`;
    }
  }
  
  if (fechaNum <= 96) {
    const day = 4 + Math.floor((fechaNum - 89) / 2);
    const dateObj = new Date(2026, 6, day);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dayNames[dateObj.getDay()]} ${day}/${7}`;
  }
  
  if (fechaNum <= 100) {
    const day = fechaNum <= 98 ? 9 : 10;
    const dateObj = new Date(2026, 6, day);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dayNames[dateObj.getDay()]} ${day}/${7}`;
  }
  
  if (fechaNum === 101) return 'Mar 14/7';
  if (fechaNum === 102) return 'Mié 15/7';
  if (fechaNum === 103) return 'Sáb 18/7';
  return 'Dom 19/7';
};

export default function PredictionsList({ matches, officialResults, isEditingOfficial = false, onChangeScore, onResetMatches }: PredictionsListProps) {
  const [selectedFecha, setSelectedFecha] = useState<number>(1);
  const [specificFecha, setSpecificFecha] = useState<number>(1);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const maxFecha = 9; // 9 total phases in the tournament

  const filteredMatches = matches.filter((match) => {
    const matchFecha = match.fecha || 1;
    const matchJornada = getMatchJornada(matchFecha);
    const matchGroup = match.group || 'C';
    const fechaMatch = selectedFecha === 10 || matchJornada === selectedFecha;
    const groupMatch = selectedGroup === 'ALL' || matchGroup === selectedGroup;
    return fechaMatch && groupMatch;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⚽ Mis Pronósticos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isEditingOfficial 
              ? 'Cargando resultados oficiales de los partidos.' 
              : 'Tocá los botones + y − para poner tu resultado.'}
          </p>
        </div>
      </div>

      {isEditingOfficial && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex items-center gap-3 text-amber-300 text-sm">
          <span className="text-xl">⚠️</span>
          <span className="font-semibold">MODO ADMINISTRADOR — Estás editando los resultados oficiales</span>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-2xl p-5 space-y-4">
        {/* Dynamic Fecha selector with arrows */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#3CDBC0]" /> Jornada
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {/* Control con flechas para pasar de Fecha */}
            <div className="flex items-center bg-[#1a1a2e]/60 rounded-xl border border-[#5B5FC7]/15 overflow-hidden">
              {/* Botón Flecha Izquierda */}
              <button
                onClick={() => {
                  const newF = Math.max(1, specificFecha - 1);
                  setSpecificFecha(newF);
                  setSelectedFecha(newF);
                }}
                disabled={specificFecha === 1}
                className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors hover:bg-slate-800/40 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
              >
                ←
              </button>

              {/* Botón Central de Fecha */}
              <button
                onClick={() => {
                  setSelectedFecha(specificFecha);
                }}
                className={`px-5 py-2 text-sm font-semibold transition-all border-x border-[#5B5FC7]/15 ${
                  selectedFecha !== 10
                    ? 'bg-[#3CDBC0]/10 text-[#3CDBC0] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {getJornadaLabel(specificFecha)}
              </button>

              {/* Botón Flecha Derecha */}
              <button
                onClick={() => {
                  const newF = Math.min(maxFecha, specificFecha + 1);
                  setSpecificFecha(newF);
                  setSelectedFecha(newF);
                }}
                disabled={specificFecha === maxFecha}
                className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors hover:bg-slate-800/40 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
              >
                →
              </button>
            </div>

            {/* Accesos directos a llaves eliminatorias */}
            {[
              { value: 4, label: '16avos' },
              { value: 5, label: '8tavos' },
              { value: 6, label: '4tos' },
              { value: 7, label: 'Semis' },
              { value: 9, label: 'Final' },
            ].map((phase) => (
              <button
                key={phase.value}
                onClick={() => {
                  setSpecificFecha(phase.value);
                  setSelectedFecha(phase.value);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedFecha === phase.value
                    ? 'bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/40 shadow-sm'
                    : 'bg-[#1a1a2e]/60 text-slate-400 border border-[#5B5FC7]/15 hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                {phase.label}
              </button>
            ))}

            {/* Botón "Todas" */}
            <button
              onClick={() => setSelectedFecha(10)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedFecha === 10
                  ? 'bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/40 shadow-sm'
                  : 'bg-[#1a1a2e]/60 text-slate-400 border border-[#5B5FC7]/15 hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        {/* Group filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#5B5FC7]" /> Grupo
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'ALL', label: 'Todos' },
              ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((l) => ({ value: l, label: l }))
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGroup(g.value)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedGroup === g.value
                    ? 'bg-[#5B5FC7]/15 text-[#5B5FC7] border border-[#5B5FC7]/40'
                    : 'bg-[#1a1a2e]/60 text-slate-400 border border-[#5B5FC7]/15 hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match count */}
      <div className="text-sm text-slate-500 px-1">
        {filteredMatches.length} {filteredMatches.length === 1 ? 'partido' : 'partidos'}
      </div>

      {/* Match Cards */}
      {filteredMatches.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500/60 mx-auto" />
          <p className="text-slate-300">No hay partidos para estos filtros.</p>
          <p className="text-sm text-slate-500">Probá cambiando la fecha o el grupo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => {
            const scores = isEditingOfficial
                ? [
                    officialResults && officialResults[match.id] ? officialResults[match.id][0] : 0,
                    officialResults && officialResults[match.id] ? officialResults[match.id][1] : 0,
                  ]
                : match.prediction;
            
            return (
              <div
                key={match.id}
                className="glass rounded-2xl p-4 sm:p-5 transition-all hover:border-[#5B5FC7]/30"
              >
                {/* Group and match day badge */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#3CDBC0] bg-[#3CDBC0]/10 px-2.5 py-1 rounded-lg border border-[#3CDBC0]/20">
                      Grupo {match.group}
                    </span>
                    <span className="text-xs text-slate-500">
                      {getJornadaLabel(getMatchJornada(match.fecha))} • {getMatchCalendarDate(match.fecha)} • {match.hora} • {match.lugar}
                    </span>
                  </div>

                {/* Main match row */}
                <div className="flex items-center justify-between gap-2">
                  
                  {/* Local Team */}
                  <div className="flex-1 flex flex-col items-center text-center gap-1 min-w-0">
                    <span className="text-4xl select-none">{getFlag(match.localTeam, match.flagLocal)}</span>
                    <span className="text-sm font-bold text-white truncate w-full">{match.localTeam}</span>
                    <span className="text-xs text-slate-500 uppercase">{match.localCode || match.localTeam.substring(0, 3).toUpperCase()}</span>
                  </div>

                  {/* Score Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Local score */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => onChangeScore(match.id, 0, scores[0] + 1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#3CDBC0]/10 border border-[#3CDBC0]/30 text-[#3CDBC0] text-xl font-bold hover:bg-[#3CDBC0]/20 transition-all active:scale-95"
                        aria-label="Sumar gol local"
                      >
                        +
                      </button>
                      <span className={`text-3xl sm:text-4xl font-extrabold tabular-nums w-12 text-center ${isEditingOfficial ? 'text-amber-400' : 'text-white'}`}>
                        {scores[0]}
                      </span>
                      <button
                        onClick={() => onChangeScore(match.id, 0, Math.max(0, scores[0] - 1))}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1a1a2e] border border-[#5B5FC7]/15 text-slate-400 text-xl font-bold hover:bg-[#5B5FC7]/10 transition-all active:scale-95"
                        aria-label="Restar gol local"
                      >
                        −
                      </button>
                    </div>

                    <span className="text-2xl text-slate-600 font-light px-1">:</span>

                    {/* Visitor score */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => onChangeScore(match.id, 1, scores[1] + 1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#3CDBC0]/10 border border-[#3CDBC0]/30 text-[#3CDBC0] text-xl font-bold hover:bg-[#3CDBC0]/20 transition-all active:scale-95"
                        aria-label="Sumar gol visitante"
                      >
                        +
                      </button>
                      <span className={`text-3xl sm:text-4xl font-extrabold tabular-nums w-12 text-center ${isEditingOfficial ? 'text-amber-400' : 'text-white'}`}>
                        {scores[1]}
                      </span>
                      <button
                        onClick={() => onChangeScore(match.id, 1, Math.max(0, scores[1] - 1))}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1a1a2e] border border-[#5B5FC7]/15 text-slate-400 text-xl font-bold hover:bg-[#5B5FC7]/10 transition-all active:scale-95"
                        aria-label="Restar gol visitante"
                      >
                        −
                      </button>
                    </div>
                  </div>

                  {/* Visitor Team */}
                  <div className="flex-1 flex flex-col items-center text-center gap-1 min-w-0">
                    <span className="text-4xl select-none">{getFlag(match.visitorTeam, match.flagVis)}</span>
                    <span className="text-sm font-bold text-white truncate w-full">{match.visitorTeam}</span>
                    <span className="text-xs text-slate-500 uppercase">{match.visitorCode || match.visitorTeam.substring(0, 3).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
