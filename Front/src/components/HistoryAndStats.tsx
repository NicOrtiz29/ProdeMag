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
  Target, CheckCircle, ChevronRight, BarChart2, Filter, User,
  Zap, Flame, PieChart, ShieldAlert, Sparkles, Smile
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

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

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

  // Compute stats per stage (includes comparison data for the leader)
  const stageData = useMemo(() => {
    if (!selectedUserId) return STAGES.map(s => ({ ...s, value: 0, leaderValue: 0, totalPoints: 0, exactCount: 0, tendencyCount: 0, totalCorrect: 0, playedInStage: 0, predictedInStage: 0 }));

    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);
    
    // Find leader ID from standings
    const leaderId = standings[0]?.id;
    const leaderPreds = leaderId ? (allUsersData?.preds || []).filter(p => p.user_id === leaderId) : [];

    return STAGES.map(stage => {
      let totalPoints = 0;
      let leaderPoints = 0;
      let exactCount = 0;
      let tendencyCount = 0;
      let totalCorrect = 0;
      let playedInStage = 0;
      let predictedInStage = 0;

      const stageMatches = matches.filter(m => m.fecha >= stage.range[0] && m.fecha <= stage.range[1]);

      stageMatches.forEach(m => {
        const real = officialResults[m.id];
        const p = userPreds.find(up => String(up.match_id) === m.id);
        const lp = leaderPreds.find(up => String(up.match_id) === m.id);
        
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
          if (lp) {
            const pts = calculateMatchPoints(lp.prediction, real);
            leaderPoints += pts;
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
        leaderValue: selectedMetric === 'points' ? leaderPoints : 0, // only compare points for layout
        totalPoints,
        exactCount,
        tendencyCount,
        totalCorrect,
        playedInStage,
        predictedInStage,
      };
    });
  }, [selectedUserId, selectedMetric, matches, officialResults, allUsersData, standings]);

  // Max value for bar scale
  const maxBarValue = useMemo(() => {
    const vals = stageData.flatMap(s => [s.value, s.leaderValue || 0]);
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

  // Advanced Stats - Predictions Bias (Local vs Draw vs Visitor)
  const predictionBias = useMemo(() => {
    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);
    let locals = 0;
    let draws = 0;
    let visitors = 0;
    const total = userPreds.length;

    userPreds.forEach(p => {
      const [l, v] = p.prediction;
      if (l > v) locals++;
      else if (l < v) visitors++;
      else draws++;
    });

    return {
      locals: total > 0 ? Math.round((locals / total) * 100) : 0,
      draws: total > 0 ? Math.round((draws / total) * 100) : 0,
      visitors: total > 0 ? Math.round((visitors / total) * 100) : 0,
      total
    };
  }, [selectedUserId, allUsersData]);

  // Advanced Stats - Streaks (Current and Max Streak)
  const streakStats = useMemo(() => {
    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);
    const playedMatches = matches
      .filter(m => officialResults[m.id] !== undefined)
      .sort((a, b) => a.fecha - b.fecha);
    
    let currentStreak = 0;
    let maxStreak = 0;
    
    playedMatches.forEach(m => {
      const real = officialResults[m.id];
      const p = userPreds.find(up => String(up.match_id) === m.id);
      if (p) {
        const pts = calculateMatchPoints(p.prediction, real);
        if (pts > 0) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      } else {
        currentStreak = 0;
      }
    });

    return { maxStreak, currentStreak };
  }, [selectedUserId, matches, officialResults, allUsersData]);

  // Advanced Stats - Group Stage Performance Heatmap
  const groupPerformance = useMemo(() => {
    if (!selectedUserId) return GROUPS.map(g => ({ group: g, accuracy: 0, points: 0, total: 0 }));
    
    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);
    
    return GROUPS.map(group => {
      const groupMatches = matches.filter(m => m.group === group);
      let groupPoints = 0;
      let playedCount = 0;
      let correctCount = 0;
      
      groupMatches.forEach(m => {
        const real = officialResults[m.id];
        const p = userPreds.find(up => String(up.match_id) === m.id);
        if (real) {
          playedCount++;
          if (p) {
            const pts = calculateMatchPoints(p.prediction, real);
            groupPoints += pts;
            if (pts > 0) correctCount++;
          }
        }
      });
      
      const accuracy = playedCount > 0 ? Math.round((correctCount / playedCount) * 100) : 0;
      return {
        group,
        accuracy,
        points: groupPoints,
        total: playedCount
      };
    });
  }, [selectedUserId, matches, officialResults, allUsersData]);

  // Achievements calculation
  const achievements = useMemo(() => {
    const userPreds = (allUsersData?.preds || []).filter(p => p.user_id === selectedUserId);
    
    let exactCount = 0;
    let tieCount = 0;
    let zeroZeroCount = 0;

    matches.forEach(m => {
      const real = officialResults[m.id];
      const p = userPreds.find(up => String(up.match_id) === m.id);
      if (real && p) {
        const pts = calculateMatchPoints(p.prediction, real);
        if (pts === 5) exactCount++;
        
        const [pl, pv] = p.prediction;
        const [rl, rv] = real;
        if (pl === pv && rl === rv && pts > 0) {
          tieCount++;
          if (pl === 0) zeroZeroCount++;
        }
      }
    });

    return [
      {
        id: 'guru',
        title: 'Gurú de Grupos',
        desc: 'Pronosticó más de 30 partidos.',
        icon: '🧠',
        active: userPreds.length >= 30,
        color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400'
      },
      {
        id: 'sniper',
        title: 'Francotirador',
        desc: 'Acertó marcador exacto (+5 pts).',
        icon: '🎯',
        active: exactCount >= 1,
        color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
      },
      {
        id: 'streak',
        title: 'Racha Imbatible',
        desc: 'Logró racha de 3 o más aciertos.',
        icon: '🔥',
        active: streakStats.maxStreak >= 3,
        color: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400'
      },
      {
        id: 'draws',
        title: 'Pacto del Empate',
        desc: 'Acertó un empate de goles.',
        icon: '🤝',
        active: tieCount >= 1,
        color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 text-purple-400'
      },
      {
        id: 'zero',
        title: 'Muro de Acero',
        desc: 'Acertó un marcador exacto de 0 - 0.',
        icon: '🛡️',
        active: zeroZeroCount >= 1,
        color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
      }
    ];
  }, [selectedUserId, matches, officialResults, allUsersData, streakStats]);

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

  const podiumColors = [
    { ring: 'ring-[#F4C430] shadow-[0_0_15px_rgba(244,196,48,0.25)]', text: 'text-[#F4C430]', bg: 'bg-[#F4C430]/10', label: '🥇' },
    { ring: 'ring-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.15)]', text: 'text-slate-300', bg: 'bg-slate-700/20', label: '🥈' },
    { ring: 'ring-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.15)]', text: 'text-amber-700', bg: 'bg-amber-900/10', label: '🥉' },
  ];

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

      {/* ═══════════ PODIUM TOP 3 ═══════════ */}
      {standings.length > 0 && (
        <div className="glass rounded-2xl p-5 overflow-hidden relative border-[#F4C430]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4C430]/5 via-transparent to-[#3CDBC0]/5 pointer-events-none" />

          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5 relative z-10">
            <Award className="w-4 h-4 text-[#F4C430]" /> Podio de Honor
          </h3>

          <div className="flex items-end justify-center gap-3 relative z-10 max-w-lg mx-auto">
            {/* Order visual: 2nd, 1st, 3rd */}
            {[standings[1], standings[0], standings[2]].map((player, visualPos) => {
              if (!player) return <div key={visualPos} className="flex-1" />;
              const rankIndex = visualPos === 0 ? 1 : visualPos === 1 ? 0 : 2;
              const col = podiumColors[rankIndex];
              const heights = ['h-20 sm:h-24', 'h-28 sm:h-36', 'h-16 sm:h-20'];
              return (
                <div key={player.id} className="flex-1 flex flex-col items-center gap-2 max-w-[140px]">
                  <div className="text-lg">{col.label}</div>
                  <div className={`w-12 h-12 rounded-full ring-2 ${col.ring} overflow-hidden flex items-center justify-center bg-[#1a1a2e]`}>
                    {renderAvatar(player.avatar, 'w-12 h-12 text-xl')}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[120px]">{player.name}</div>
                    <div className={`text-sm sm:text-base font-extrabold ${col.text} tabular-nums`}>{player.points} pts</div>
                  </div>
                  <div className={`w-full ${heights[visualPos]} ${col.bg} border ${col.ring.split(' ')[0].replace('ring', 'border')}/30 rounded-t-xl`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ MAIN ANALYTICS ROW (Chart & Stats) ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CHART SECTION (Span 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* INTERACTIVE COMPARATIVE BAR CHART */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5B5FC7]/10 pb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#3CDBC0]" />
                <h3 className="font-bold text-white text-sm">Progreso por Ronda</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* User Dropdown */}
                <div className="flex items-center gap-1.5 bg-[#1a1a2e] border border-[#5B5FC7]/20 rounded-xl px-2.5 py-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[130px]"
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
                    <option value="points" className="bg-[#0f0f23] text-white">Puntos</option>
                    <option value="exact" className="bg-[#0f0f23] text-white">Exactos</option>
                    <option value="tendency" className="bg-[#0f0f23] text-white">Tendencia</option>
                    <option value="any" className="bg-[#0f0f23] text-white">Total aciertos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Graphic Bars */}
            <div className="space-y-2">
              <div className="flex items-end justify-between h-48 pt-6 pb-2 px-2 bg-[#0a0a1e]/60 rounded-xl border border-white/5 relative">
                
                {/* Grid Lines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 border-t border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 border-t border-white/[0.03] pointer-events-none" />

                {stageData.map((stage) => {
                  const isSelected = stage.id === selectedStageId;
                  const barHeightPct = (stage.value / maxBarValue) * 100;
                  const leaderHeightPct = ((stage.leaderValue || 0) / maxBarValue) * 100;
                  const isPointsMetric = selectedMetric === 'points';

                  return (
                    <div
                      key={stage.id}
                      onClick={() => setSelectedStageId(stage.id)}
                      className="flex-1 flex flex-col items-center group cursor-pointer"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-[#0f0f23] border border-[#5B5FC7]/30 text-white rounded-lg p-2.5 text-[10px] space-y-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl max-w-[160px]">
                        <p className="font-bold text-[#3CDBC0]">{stage.name}</p>
                        <p>Puntos: <span className="font-bold text-white">{stage.totalPoints}</span></p>
                        {isPointsMetric && standings[0] && (
                          <p className="text-slate-400">{standings[0].name} (Líder): <span className="font-bold text-amber-400">{stage.leaderValue}</span></p>
                        )}
                        <p>Exactos: <span className="font-bold text-emerald-400">{stage.exactCount}</span></p>
                        <p>Pronosticados: <span className="font-bold text-[#75AADB]">{stage.predictedInStage}/{stage.playedInStage}</span></p>
                      </div>

                      {/* Twin Bar Container */}
                      <div className="w-10 sm:w-12 h-32 flex items-end justify-center gap-0.5">
                        
                        {/* Selected User Bar */}
                        <div
                          style={{ height: `${Math.max(barHeightPct, 4)}%` }}
                          className={`w-3.5 sm:w-4 rounded-t bg-gradient-to-t ${stage.color} transition-all duration-500 relative ${
                            isSelected 
                              ? 'ring-1.5 ring-white/60 shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                              : 'opacity-85'
                          }`}
                        >
                          {stage.value > 0 && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-white px-0.5 rounded">
                              {stage.value}
                            </span>
                          )}
                        </div>

                        {/* Leader Bar (Only shown for comparison on points metric) */}
                        {isPointsMetric && stage.leaderValue > 0 && selectedUserId !== standings[0]?.id && (
                          <div
                            style={{ height: `${Math.max(leaderHeightPct, 4)}%` }}
                            className="w-2.5 sm:w-3 rounded-t bg-gradient-to-t from-slate-600 to-amber-500/60 opacity-50 relative"
                          >
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-amber-300">
                              {stage.leaderValue}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Label under the twin bar */}
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

            {/* Selected Stage Banner */}
            {stageStats && (
              <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#5B5FC7]/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" /> Detalle: {stageStats.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hacé clic en las barras de arriba para ver otras rondas.
                  </p>
                </div>
                
                <div className="flex gap-4 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Puntos</span>
                    <span className="text-sm font-extrabold text-white">{stageStats.totalPoints}</span>
                  </div>
                  <div className="border-l border-[#5B5FC7]/10 h-7 self-center" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Exactos</span>
                    <span className="text-sm font-extrabold text-emerald-400">{stageStats.exactCount}</span>
                  </div>
                  <div className="border-l border-[#5B5FC7]/10 h-7 self-center" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Pronósticos</span>
                    <span className="text-sm font-extrabold text-[#75AADB]">{stageStats.predictedInStage} / {stageStats.playedInStage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DETAILED MATCHES LIST FOR STAGE */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F4C430]" /> Partidos en {selectedStage.name}
            </h3>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-none">
              {stageMatchesDetails.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">
                  No hay partidos jugados con resultados oficiales en esta ronda.
                </p>
              ) : (
                stageMatchesDetails.map((match) => (
                  <div
                    key={match.id}
                    className="bg-[#0f0f23]/60 rounded-xl p-3 border border-[#5B5FC7]/10 flex flex-col sm:flex-row items-center justify-between gap-3 hover:border-[#3CDBC0]/30 transition-colors"
                  >
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

                    <div className="flex items-center justify-center gap-6 w-full sm:w-auto">
                      <div className="text-center">
                        <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Tu Prode</span>
                        <span className="text-xs font-bold text-slate-300">
                          {match.prediction ? `${match.prediction[0]} - ${match.prediction[1]}` : 'Sin pronóstico'}
                        </span>
                      </div>
                      <div className="border-l border-white/5 h-6" />
                      <div className="text-center">
                        <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Resultado</span>
                        <span className="text-xs font-bold text-white">
                          {match.realResult ? `${match.realResult[0]} - ${match.realResult[1]}` : 'Pendiente'}
                        </span>
                      </div>
                    </div>

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

        </div>

        {/* STATS AND ACHIEVEMENTS PANEL */}
        <div className="space-y-6">

          {/* ADVANCED STATS PANEL */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#5B5FC7]/10 pb-3">
              <PieChart className="w-4.5 h-4.5 text-[#3CDBC0]" /> Estadísticas de Pronóstico
            </h3>

            {/* Streak & Accuracy Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a2e]/60 rounded-xl p-3 border border-[#5B5FC7]/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase font-semibold">Racha Máx</span>
                  <span className="text-sm font-black text-white">{streakStats.maxStreak} partidos</span>
                </div>
              </div>
              <div className="bg-[#1a1a2e]/60 rounded-xl p-3 border border-[#5B5FC7]/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3CDBC0]/10 flex items-center justify-center text-[#3CDBC0]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase font-semibold">Racha Act</span>
                  <span className="text-sm font-black text-white">{streakStats.currentStreak} partidos</span>
                </div>
              </div>
            </div>

            {/* Prediction Bias distribution bars */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sesgo de Apuestas</h4>
              <div className="h-3 rounded-full overflow-hidden flex bg-slate-800 text-[8px] font-black text-white">
                {predictionBias.locals > 0 && (
                  <div style={{ width: `${predictionBias.locals}%` }} className="bg-[#75AADB] h-full flex items-center justify-center" title="Local">
                    L
                  </div>
                )}
                {predictionBias.draws > 0 && (
                  <div style={{ width: `${predictionBias.draws}%` }} className="bg-[#3CDBC0] h-full flex items-center justify-center" title="Empate">
                    E
                  </div>
                )}
                {predictionBias.visitors > 0 && (
                  <div style={{ width: `${predictionBias.visitors}%` }} className="bg-rose-500 h-full flex items-center justify-center" title="Visitante">
                    V
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#75AADB]" /> Local ({predictionBias.locals}%)</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3CDBC0]" /> Empate ({predictionBias.draws}%)</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Vis. ({predictionBias.visitors}%)</span>
              </div>
            </div>
          </div>

          {/* PERFORMANCE BY GROUP HEATMAP GRID */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#5B5FC7]/10 pb-3">
              <Star className="w-4.5 h-4.5 text-[#F4C430]" /> Rendimiento por Grupo
            </h3>
            <p className="text-[10px] text-slate-400">Eficiencia de aciertos por zona (A-L):</p>
            <div className="grid grid-cols-4 gap-1.5">
              {groupPerformance.map(gp => {
                const getHeatBg = (acc: number) => {
                  if (acc >= 75) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                  if (acc >= 50) return 'bg-[#75AADB]/20 border-[#75AADB]/40 text-[#75AADB]';
                  if (acc >= 25) return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
                  if (gp.total === 0) return 'bg-slate-800/40 border-slate-800 text-slate-600';
                  return 'bg-red-500/10 border-red-500/30 text-red-300';
                };
                return (
                  <div
                    key={gp.group}
                    className={`rounded-lg p-1.5 border text-center ${getHeatBg(gp.accuracy)}`}
                    title={`Acierto: ${gp.accuracy}% (${gp.points} pts en ${gp.total} partidos)`}
                  >
                    <span className="block text-[10px] font-black">Gp {gp.group}</span>
                    <span className="text-[9px] font-medium block mt-0.5">{gp.accuracy}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI ORACLE BATTLE CARD */}
          <div className="rounded-2xl border border-[#3CDBC0]/30 bg-gradient-to-br from-[#3CDBC0]/15 to-[#5B5FC7]/10 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3CDBC0]/5 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#3CDBC0] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" /> Batalla de Cerebros
              </span>
              <span className="text-[9px] bg-slate-900/50 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                VS ORÁCULO IA
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-left">
                <p className="text-[10px] text-slate-400">Tus Puntos</p>
                <p className="text-xl font-black text-white">{selectedUser?.points || 0}</p>
              </div>
              <div className="text-center font-bold text-slate-500 text-xs">vs</div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Oráculo IA</p>
                {/* IA Bot usually ranks high, let's look for bot named oracle or default to leader's or simulated 32 pts */}
                <p className="text-xl font-black text-[#3CDBC0]">
                  {standings.find(s => s.isBot)?.points || Math.max((standings[0]?.points || 20) - 2, 12)}
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-300 bg-slate-900/40 p-2 rounded-lg leading-relaxed">
              { (selectedUser?.points || 0) >= (standings.find(s => s.isBot)?.points || 20) ? (
                <span>🎉 ¡Felicitaciones! Estás superando las predicciones de nuestra Inteligencia Artificial.</span>
              ) : (
                <span>🤖 El Oráculo IA lleva la delantera. ¡Ajustá tus pronósticos en la próxima ronda para ganarle!</span>
              )}
            </div>
          </div>

          {/* ACHIEVEMENTS AND BADGES PANEL */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#5B5FC7]/10 pb-3">
              <Award className="w-4.5 h-4.5 text-[#F4C430]" /> Logros Obtenidos
            </h3>
            
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                    ach.active
                      ? `bg-gradient-to-r ${ach.color}`
                      : 'bg-[#1a1a2e]/25 border-dashed border-slate-800 opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {ach.title}
                      {ach.active && <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded font-black text-white">LOCKED</span>}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
