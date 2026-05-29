/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StandingsEntry, Match } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateMatchPoints } from '../utils/points';
import {
  Calendar, Trophy, Star, Globe, Award, TrendingUp,
  Target, CheckCircle, ChevronRight, BarChart2, Filter, User
} from 'lucide-react';

interface HistoryAndStatsProps {
  standings?: StandingsEntry[];
  matches?: Match[];
  officialResults?: Record<string, [number, number]>;
  allUsersData?: { users: any[]; preds: any[] };
}

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const STAGES = [
  { id: 'g1', name: 'Grupo F1', range: [1, 24], color: 'from-[#75AADB] to-[#5B5FC7]' },
  { id: 'g2', name: 'Grupo F2', range: [25, 48], color: 'from-[#5B5FC7] to-[#75AADB]' },
  { id: 'g3', name: 'Grupo F3', range: [49, 72], color: 'from-[#3CDBC0] to-[#5B5FC7]' },
  { id: 'r32', name: 'Ronda 32', range: [73, 88], color: 'from-[#F4C430] to-[#DAA520]' },
  { id: 'r16', name: 'Octavos', range: [89, 96], color: 'from-pink-500 to-rose-600' },
  { id: 'qf', name: 'Cuartos', range: [97, 100], color: 'from-purple-500 to-indigo-600' },
  { id: 'sf', name: 'Semis', range: [101, 102], color: 'from-orange-500 to-red-600' },
  { id: 'fn', name: 'Finales', range: [103, 104], color: 'from-emerald-400 to-teal-600' }
];

export default function HistoryAndStats({
  standings = [],
  matches = [],
  officialResults = {},
  allUsersData = { users: [], preds: [] }
}: HistoryAndStatsProps) {
  const { user } = useAuth();
  
  // State for chart filters
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<'points' | 'exact' | 'tendency' | 'any'>('points');
  const [selectedStageId, setSelectedStageId] = useState<string>('g1');

  // Set default selected user when authenticated user is available
  useEffect(() => {
    if (user?.id && !selectedUserId) {
      setSelectedUserId(user.id);
    }
  }, [user, selectedUserId]);

  const leader = standings[0]?.name || '—';
  const runnerUp = standings[1]?.name || '—';
  const totalPlayers = standings.length;
  const totalPoints = standings.reduce((acc, s) => acc + s.points, 0);
  const topScore = standings[0]?.points ?? 0;

  const animTopScore = useAnimatedCounter(topScore);
  const animTotal = useAnimatedCounter(totalPlayers);
  const animTotalPts = useAnimatedCounter(totalPoints);

  // Get active user data
  const selectedUser = useMemo(() => {
    return standings.find(s => s.id === selectedUserId) || standings.find(s => s.id === user?.id) || standings[0];
  }, [standings, selectedUserId, user]);

  // Compute stats per stage
  const stageData = useMemo(() => {
    if (!selectedUserId) return STAGES.map(s => ({ ...s, value: 0, totalPoints: 0, exactCount: 0, tendencyCount: 0, totalCorrect: 0, playedInStage: 0, predictedInStage: 0 }));

    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);

    return STAGES.map(stage => {
      let totalPoints = 0;
      let exactCount = 0;
      let tendencyCount = 0;
      let totalCorrect = 0;
      let playedInStage = 0;
      let predictedInStage = 0;

      const stageMatches = matches.filter(m => m.fecha >= stage.range[0] && m.fecha <= stage.range[1]);

      stageMatches.forEach(m => {
        const real = officialResults[m.id];
        const p = userPreds.find(up => String(up.match_id) === m.id);
        
        if (real) {
          playedInStage++;
          if (p) {
            predictedInStage++;
            const pts = calculateMatchPoints(p.prediction, real);
            totalPoints += pts;
            if (pts === 5) {
              exactCount++;
              totalCorrect++;
            } else if (pts === 3) {
              tendencyCount++;
              totalCorrect++;
            } else if (pts > 0) {
              totalCorrect++;
            }
          }
        }
      });

      let value = 0;
      if (selectedMetric === 'points') value = totalPoints;
      else if (selectedMetric === 'exact') value = exactCount;
      else if (selectedMetric === 'tendency') value = tendencyCount;
      else if (selectedMetric === 'any') value = totalCorrect;

      return {
        ...stage,
        value,
        totalPoints,
        exactCount,
        tendencyCount,
        totalCorrect,
        playedInStage,
        predictedInStage,
      };
    });
  }, [selectedUserId, selectedMetric, matches, officialResults, allUsersData]);

  // Max value for bar scale
  const maxBarValue = useMemo(() => {
    const vals = stageData.map(s => s.value);
    const max = Math.max(...vals);
    return max === 0 ? 10 : max;
  }, [stageData]);

  // Current selected stage matches detailed breakdown
  const selectedStage = STAGES.find(s => s.id === selectedStageId) || STAGES[0];
  const stageStats = stageData.find(s => s.id === selectedStageId);

  const stageMatchesDetails = useMemo(() => {
    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);
    const stageMatches = matches.filter(m => m.fecha >= selectedStage.range[0] && m.fecha <= selectedStage.range[1]);

    return stageMatches.map(m => {
      const real = officialResults[m.id];
      const p = userPreds.find(up => String(up.match_id) === m.id);
      const pointsEarned = (real && p) ? calculateMatchPoints(p.prediction, real) : null;

      return {
        ...m,
        prediction: p ? p.prediction : null,
        realResult: real || null,
        pointsEarned
      };
    });
  }, [selectedStage, selectedUserId, matches, officialResults, allUsersData]);

  const renderAvatar = (avatar: string | undefined, size: string = 'w-8 h-8 text-lg') => {
    if (avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.length > 8)) {
      return <img src={avatar} className={`${size} rounded-full object-cover select-none shrink-0`} alt="Avatar" />;
    }
    return <span className={`${size} flex items-center justify-center select-none shrink-0`}>{avatar || '⚽'}</span>;
  };

  const getPointsBadgeColor = (pts: number | null) => {
    if (pts === null) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (pts === 5) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (pts === 3) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (pts > 0) return 'bg-[#75AADB]/10 text-[#75AADB] border-[#75AADB]/30';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ═══════════ HERO STATS BAR ═══════════ */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />

        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-[#F4C430]" />
          <h2 className="text-xl font-bold text-white">Historial y Estadísticas</h2>
          <span className="ml-auto text-[10px] font-mono font-bold bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/20 px-2 py-0.5 rounded-full">
            TEMPORADA 2026
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Jugadores',
              value: animTotal,
              icon: <Globe className="w-4 h-4" />,
              color: 'text-[#75AADB]',
              bg: 'bg-[#75AADB]/10 border-[#75AADB]/20',
            },
            {
              label: 'Puntos Totales',
              value: animTotalPts,
              icon: <Trophy className="w-4 h-4" />,
              color: 'text-[#3CDBC0]',
              bg: 'bg-[#3CDBC0]/10 border-[#3CDBC0]/20',
            },
            {
              label: 'Puntaje Líder',
              value: animTopScore,
              icon: <Star className="w-4 h-4" />,
              color: 'text-[#F4C430]',
              bg: 'bg-[#F4C430]/10 border-[#F4C430]/20',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.bg} border rounded-xl p-3 text-center transition-all hover:scale-[1.03] duration-300`}
            >
              <div className={`${stat.color} flex items-center justify-center mb-1.5`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-extrabold ${stat.color} tabular-nums`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ INTERACTIVE BAR CHART ═══════════ */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5B5FC7]/10 pb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#3CDBC0]" />
            <h3 className="font-bold text-white text-sm">Rendimiento por Fecha / Ronda</h3>
          </div>
          
          {/* Filters controls */}
          <div className="flex flex-wrap gap-2">
            {/* User Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#1a1a2e] border border-[#5B5FC7]/20 rounded-xl px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer max-w-[130px]"
              >
                {standings.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0f0f23] text-white">
                    {s.name} {s.id === user?.id ? '(Vos)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Metric Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#1a1a2e] border border-[#5B5FC7]/20 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="points" className="bg-[#0f0f23] text-white">Puntos ganados</option>
                <option value="exact" className="bg-[#0f0f23] text-white">Aciertos exactos</option>
                <option value="tendency" className="bg-[#0f0f23] text-white">Aciertos tendencia</option>
                <option value="any" className="bg-[#0f0f23] text-white">Total aciertos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Graphic Bars Canvas */}
        <div className="space-y-2">
          <div className="flex items-end justify-between h-48 pt-6 pb-2 px-2 bg-[#0a0a1e]/60 rounded-xl border border-white/5 relative">
            
            {/* Grid Line Marks */}
            <div className="absolute inset-x-0 top-1/4 border-t border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-white/[0.03] pointer-events-none" />

            {stageData.map((stage) => {
              const isSelected = stage.id === selectedStageId;
              const barHeightPct = (stage.value / maxBarValue) * 100;

              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className="flex-1 flex flex-col items-center group cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-[#0f0f23] border border-[#5B5FC7]/30 text-white rounded-lg p-2 text-[10px] space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl max-w-[150px]">
                    <p className="font-bold text-[#3CDBC0]">{stage.name}</p>
                    <p>Puntos: <span className="font-bold text-white">{stage.totalPoints}</span></p>
                    <p>Exactos: <span className="font-bold text-emerald-400">{stage.exactCount}</span></p>
                    <p>Pronosticados: <span className="font-bold text-[#75AADB]">{stage.predictedInStage}/{stage.playedInStage}</span></p>
                  </div>

                  {/* The Bar */}
                  <div className="w-6 sm:w-8 h-32 flex items-end">
                    <div
                      style={{ height: `${Math.max(barHeightPct, 4)}%` }}
                      className={`w-full rounded-t-md bg-gradient-to-t ${stage.color} transition-all duration-500 relative ${
                        isSelected 
                          ? 'ring-2 ring-white/60 shadow-[0_0_15px_rgba(255,255,255,0.25)] scale-x-105' 
                          : 'opacity-70 group-hover:opacity-100'
                      }`}
                    >
                      {/* Floating value inside the bar (only if there's height) */}
                      {stage.value > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white bg-slate-800/80 px-1 rounded">
                          {stage.value}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Label under the bar */}
                  <span className={`text-[9px] mt-2 font-bold truncate max-w-full text-center ${
                    isSelected ? 'text-[#3CDBC0] font-black' : 'text-slate-500'
                  }`}>
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Summary Banner */}
        {stageStats && (
          <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#5B5FC7]/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" /> Detalle de: {stageStats.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Seleccioná otra barra en el gráfico para cambiar de ronda.
              </p>
            </div>
            
            <div className="flex gap-4 text-center">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Puntos</span>
                <span className="text-base font-extrabold text-white">{stageStats.totalPoints}</span>
              </div>
              <div className="border-l border-[#5B5FC7]/10 h-7 self-center" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Exactos</span>
                <span className="text-base font-extrabold text-emerald-400">{stageStats.exactCount}</span>
              </div>
              <div className="border-l border-[#5B5FC7]/10 h-7 self-center" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Pronosticados</span>
                <span className="text-base font-extrabold text-[#75AADB]">{stageStats.predictedInStage} / {stageStats.playedInStage}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ DETAILED MATCHES LIST FOR STAGE ═══════════ */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#F4C430]" /> Partidos y Aciertos en {selectedStage.name}
        </h3>

        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-none">
          {stageMatchesDetails.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">
              No hay partidos jugados con resultados oficiales en esta ronda todavía.
            </p>
          ) : (
            stageMatchesDetails.map((match) => (
              <div
                key={match.id}
                className="bg-[#0f0f23]/60 rounded-xl p-3 border border-[#5B5FC7]/10 flex flex-col sm:flex-row items-center justify-between gap-3 hover:border-[#3CDBC0]/30 transition-colors"
              >
                {/* Match Teams Info */}
                <div className="flex items-center gap-2 w-full sm:w-2/5 min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 w-8">#{match.id.split('_').pop()}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">{match.localTeam}</span>
                    <span className="text-xs text-slate-500">{match.flagLocal}</span>
                    <span className="text-[10px] text-slate-500 font-bold px-1.5 py-0.5 bg-white/5 rounded">VS</span>
                    <span className="text-xs text-slate-500">{match.flagVis}</span>
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">{match.visitorTeam}</span>
                  </div>
                </div>

                {/* Score comparisons */}
                <div className="flex items-center justify-center gap-6 w-full sm:w-auto">
                  {/* Predictions info */}
                  <div className="text-center">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Tu Prode</span>
                    <span className="text-xs font-bold text-slate-300">
                      {match.prediction ? `${match.prediction[0]} - ${match.prediction[1]}` : 'Sin pronóstico'}
                    </span>
                  </div>

                  <div className="border-l border-white/5 h-6" />

                  {/* Real Result */}
                  <div className="text-center">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Resultado</span>
                    <span className="text-xs font-bold text-white">
                      {match.realResult ? `${match.realResult[0]} - ${match.realResult[1]}` : 'Pendiente'}
                    </span>
                  </div>
                </div>

                {/* Points Earned Badge */}
                <div className="w-full sm:w-24 text-right">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border ${getPointsBadgeColor(match.pointsEarned)}`}>
                    {match.pointsEarned !== null ? `+${match.pointsEarned} pts` : '—'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ═══════════ TRIVIA SECTION ═══════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Star className="w-4 h-4 text-[#F4C430]" />
          <h3 className="font-bold text-white text-sm">¿Sabías que...?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: '🌎',
              title: '3 Países Sede',
              fact: 'El Mundial 2026 es el primero con 3 sedes: USA, México y Canadá. ¡48 selecciones compiten!',
              color: 'from-emerald-500/20 to-emerald-900/10',
              border: 'border-emerald-500/20',
              iconColor: 'text-emerald-400',
            },
            {
              icon: '⚽',
              title: '104 Partidos',
              fact: 'El torneo más grande de la historia con 104 partidos, superando los 64 de Qatar 2022.',
              color: 'from-cyan-500/20 to-cyan-900/10',
              border: 'border-cyan-500/20',
              iconColor: 'text-cyan-400',
            },
          ].map((trivia, idx) => (
            <div
              key={idx}
              className={`glass rounded-xl p-4 border ${trivia.border} bg-gradient-to-br ${trivia.color} transition-all duration-500 hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{trivia.icon}</span>
                <div>
                  <h4 className={`font-bold text-sm ${trivia.iconColor}`}>{trivia.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{trivia.fact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
