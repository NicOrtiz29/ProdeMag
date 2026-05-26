import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Match } from '../types';

interface PredictionsListProps {
  matches: Match[];
  officialResults?: Record<string, [number, number]>;
  isEditingOfficial?: boolean;
  onChangeScore: (id: string, index: 0 | 1, value: number) => void;
  onResetMatches: () => void;
}

export default function PredictionsList({ matches, officialResults, isEditingOfficial = false, onChangeScore, onResetMatches }: PredictionsListProps) {
  const [selectedFecha, setSelectedFecha] = useState<number>(1);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const filteredMatches = matches.filter((match) => {
    const matchFecha = match.fecha || 1;
    const matchGroup = match.group || 'C';
    const fechaMatch = selectedFecha === 4 || matchFecha === selectedFecha;
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
        {!isEditingOfficial && (
          <button
            onClick={onResetMatches}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-[#5B5FC7]/20 hover:border-[#3CDBC0]/40 text-sm text-slate-300 hover:text-white transition-all shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        )}
      </div>

      {isEditingOfficial && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex items-center gap-3 text-amber-300 text-sm">
          <span className="text-xl">⚠️</span>
          <span className="font-semibold">MODO ADMINISTRADOR — Estás editando los resultados oficiales</span>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-2xl p-5 space-y-4">
        {/* Fecha selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#3CDBC0]" /> Jornada
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 1, label: 'Fecha 1' },
              { value: 2, label: 'Fecha 2' },
              { value: 3, label: 'Fecha 3' },
              { value: 4, label: 'Todas' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setSelectedFecha(f.value)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedFecha === f.value
                    ? 'bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/40 shadow-sm'
                    : 'bg-[#1a1a2e]/60 text-slate-400 border border-[#5B5FC7]/15 hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                {f.label}
              </button>
            ))}
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
              ? [officialResults?.[match.id]?.[0] || 0, officialResults?.[match.id]?.[1] || 0]
              : match.prediction;
            
            return (
              <div
                key={match.id}
                className="glass rounded-2xl p-4 sm:p-5 transition-all hover:border-[#5B5FC7]/30"
              >
                {/* Group and match day badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-[#3CDBC0] bg-[#3CDBC0]/10 px-2.5 py-1 rounded-lg border border-[#3CDBC0]/20">
                    Grupo {match.group}
                  </span>
                  <span className="text-xs text-slate-500">
                    Fecha {match.fecha}
                  </span>
                </div>

                {/* Main match row */}
                <div className="flex items-center justify-between gap-2">
                  
                  {/* Local Team */}
                  <div className="flex-1 flex flex-col items-center text-center gap-1 min-w-0">
                    <span className="text-4xl select-none">{match.flagLocal}</span>
                    <span className="text-sm font-bold text-white truncate w-full">{match.localTeam}</span>
                    <span className="text-xs text-slate-500 uppercase">{match.localCode}</span>
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
                    <span className="text-4xl select-none">{match.flagVis}</span>
                    <span className="text-sm font-bold text-white truncate w-full">{match.visitorTeam}</span>
                    <span className="text-xs text-slate-500 uppercase">{match.visitorCode}</span>
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
