/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HistoricalMatch, StandingsEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Calendar, Trophy, Sparkles, TrendingUp, Zap, Target,
  CheckCircle, XCircle, ArrowRight, Brain, Flame, Star,
  Globe, Timer, Award
} from 'lucide-react';
import PointsTrendChart from './PointsTrendChart';

interface HistoryAndStatsProps {
  historicalMatches: HistoricalMatch[];
  standings?: StandingsEntry[];
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

export default function HistoryAndStats({ historicalMatches, standings = [] }: HistoryAndStatsProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [triviaIndex, setTriviaIndex] = useState(0);

  const { user } = useAuth();
  const [matchComments, setMatchComments] = useState<Record<string, Array<{ from: string; text: string; created_at: string }>>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) {
        const grouped: Record<string, any[]> = {};
        data.forEach(msg => {
          if (msg.text && msg.text.startsWith('[match:')) {
            const match = msg.text.match(/^\[match:([^\]]+)\]\s*(.*)$/);
            if (match) {
              const matchId = match[1];
              const commentText = match[2];
              if (!grouped[matchId]) grouped[matchId] = [];
              grouped[matchId].push({
                from: msg.from,
                text: commentText,
                created_at: msg.created_at
              });
            }
          }
        });
        setMatchComments(grouped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComments();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('public:messages_comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const postComment = async (matchId: string) => {
    const text = commentInputs[matchId]?.trim();
    if (!text || !user) return;
    
    const formattedText = `[match:${matchId}] ${text}`;
    const { error } = await supabase.from('messages').insert({
      text: formattedText,
      from: user.name || 'Usuario',
      created_at: new Date().toISOString()
    });

    if (!error) {
      setCommentInputs(prev => ({ ...prev, [matchId]: '' }));
      fetchComments();
    }
  };

  const leader = standings[0]?.name || 'Santi';
  const runnerUp = standings[1]?.name || 'Flor';

  const TRIVIA_CARDS = [
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
    {
      icon: '🏟️',
      title: '16 Estadios',
      fact: 'Desde el MetLife de Nueva York hasta el Azteca de CDMX, 16 templos del fútbol.',
      color: 'from-amber-500/20 to-amber-900/10',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: '🏆',
      title: 'Duelo de Líderes',
      fact: `${leader} y ${runnerUp} vienen cabeza a cabeza por el liderazgo del Prode en la oficina.`,
      color: 'from-purple-500/20 to-purple-900/10',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  // Auto-rotate trivia
  useEffect(() => {
    const interval = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % TRIVIA_CARDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [TRIVIA_CARDS.length]);

  // Compute aggregated stats
  const totalMatches = historicalMatches.length;
  const botExactHits = historicalMatches.filter(
    m => m.oraclePrediction[0] === m.realResult[0] && m.oraclePrediction[1] === m.realResult[1]
  ).length;
  const humanExactHits = historicalMatches.filter(
    m => m.humanPrediction[0] === m.realResult[0] && m.humanPrediction[1] === m.realResult[1]
  ).length;
  const totalBotPoints = historicalMatches.reduce((acc, m) => acc + m.pointsOracle, 0);
  const totalHumanPoints = historicalMatches.reduce((acc, m) => acc + m.pointsHuman, 0);

  const botIsLeader = totalBotPoints >= totalHumanPoints;
  const botRole = botIsLeader ? 'Líder' : 'Escolta';
  const humanRole = botIsLeader ? 'Escolta' : 'Líder';

  // Animated counters
  const animBotPts = useAnimatedCounter(totalBotPoints);
  const animHumanPts = useAnimatedCounter(totalHumanPoints);
  const animMatches = useAnimatedCounter(totalMatches);

  const getMatchBadge = (hm: HistoricalMatch, who: 'oracle' | 'human') => {
    const pred = who === 'oracle' ? hm.oraclePrediction : hm.humanPrediction;
    const real = hm.realResult;
    const isExact = pred[0] === real[0] && pred[1] === real[1];
    const predDiff = pred[0] - pred[1];
    const realDiff = real[0] - real[1];
    const isTrend = !isExact && (
      (predDiff > 0 && realDiff > 0) ||
      (predDiff < 0 && realDiff < 0) ||
      (predDiff === 0 && realDiff === 0)
    );

    if (isExact) return { label: 'EXACTO', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" /> };
    if (isTrend) return { label: 'TENDENCIA', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: <TrendingUp className="w-3 h-3" /> };
    return { label: 'FALLO', color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ═══════════ HERO STATS BAR ═══════════ */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        {/* Shimmer background */}
        <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />

        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-[#F4C430]" />
          <h2 className="text-xl font-bold text-white">Historial y Estadísticas</h2>
          <span className="ml-auto text-[10px] font-mono font-bold bg-[#3CDBC0]/10 text-[#3CDBC0] border border-[#3CDBC0]/20 px-2 py-0.5 rounded-full">
            TEMPORADA 2026
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Partidos',
              value: animMatches,
              icon: <Globe className="w-4 h-4" />,
              color: 'text-[#75AADB]',
              bg: 'bg-[#75AADB]/10 border-[#75AADB]/20',
            },
            {
              label: `Pts Santi (${botRole})`,
              value: animBotPts,
              icon: <Trophy className="w-4 h-4" />,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20',
            },
            {
              label: `Pts Flor (${humanRole})`,
              value: animHumanPts,
              icon: <Flame className="w-4 h-4" />,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
            },
            {
              label: 'Exactos Santi',
              value: `${botExactHits}/${totalMatches}`,
              icon: <Target className="w-4 h-4" />,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              isString: true,
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
                {(stat as any).isString ? stat.value : stat.value}
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ POINTS TREND CHART ═══════════ */}
      <PointsTrendChart standings={standings} />

      {/* ═══════════ MATCH HISTORY GRID ═══════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-[#F4C430]" />
          <h3 className="font-bold text-white text-sm">Bitácora de Partidos</h3>
          <span className="text-[10px] text-slate-500 ml-auto font-mono">
            {totalMatches} partidos analizados
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {historicalMatches.map((hm) => {
            const isSelected = selectedMatchId === hm.id;
            const oracleBadge = getMatchBadge(hm, 'oracle');
            const humanBadge = getMatchBadge(hm, 'human');
            const oracleWon = hm.pointsOracle > hm.pointsHuman;
            const humanWon = hm.pointsHuman > hm.pointsOracle;

            return (
              <div
                key={hm.id}
                onClick={() => setSelectedMatchId(isSelected ? null : hm.id)}
                className={`glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-400 hover:shadow-xl group ${
                  isSelected
                    ? 'border-[#3CDBC0]/40 shadow-[0_0_20px_rgba(60,219,192,0.08)] scale-[1.01]'
                    : 'hover:border-slate-600/40 hover:scale-[1.01]'
                }`}
              >
                {/* Match header */}
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white text-sm truncate pr-2 group-hover:text-[#3CDBC0] transition-colors">
                      {hm.matchName}
                    </h4>
                    <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      oracleWon
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        : humanWon
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                    }`}>
                      {oracleWon ? '👨‍💻 Santi Ganó' : humanWon ? '👩‍💼 Flor' : '🤝 Empate'}
                    </span>
                  </div>

                  {/* 3-column score layout */}
                  <div className="grid grid-cols-3 gap-1.5 bg-[#0a0a1e] rounded-xl p-2.5 border border-[#5B5FC7]/10">
                    {/* Real result */}
                    <div className="text-center py-2">
                      <span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Resultado</span>
                      <span className="font-extrabold text-xl text-white tracking-wider">
                        {hm.realResult[0]}-{hm.realResult[1]}
                      </span>
                      <span className="text-[8px] text-slate-600 font-semibold block mt-0.5">OFICIAL</span>
                    </div>

                    {/* Oracle prediction */}
                    <div className="text-center py-2 border-x border-[#5B5FC7]/10 bg-cyan-950/20 rounded-lg">
                      <span className="text-[9px] uppercase text-cyan-400 font-bold block mb-1">👨‍💻 Santi</span>
                      <span className="font-extrabold text-xl text-cyan-300 tracking-wider">
                        {hm.oraclePrediction[0]}-{hm.oraclePrediction[1]}
                      </span>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <span className={`inline-flex items-center gap-0.5 text-[8px] font-bold uppercase px-1.5 py-px rounded-full border ${oracleBadge.color}`}>
                          {oracleBadge.icon} {oracleBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Human prediction */}
                    <div className="text-center py-2">
                      <span className="text-[9px] uppercase text-amber-400 font-bold block mb-1">👩‍💼 Flor</span>
                      <span className="font-extrabold text-xl text-amber-300 tracking-wider">
                        {hm.humanPrediction[0]}-{hm.humanPrediction[1]}
                      </span>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <span className={`inline-flex items-center gap-0.5 text-[8px] font-bold uppercase px-1.5 py-px rounded-full border ${humanBadge.color}`}>
                          {humanBadge.icon} {humanBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Points earned bar */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${(hm.pointsOracle / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-cyan-400 tabular-nums w-8 text-right">+{hm.pointsOracle}</span>
                    <span className="text-[10px] text-slate-600">vs</span>
                    <span className="text-xs font-bold text-amber-400 tabular-nums w-8">+{hm.pointsHuman}</span>
                    <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 float-right"
                        style={{ width: `${(hm.pointsHuman / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable commentary */}
                <div className={`overflow-hidden transition-all duration-400 ${isSelected ? 'max-h-[550px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-[#0a0a1e] border border-[#5B5FC7]/10 rounded-xl p-3 flex items-start gap-2.5">
                      <span className="text-lg shrink-0 mt-0.5">👨‍💻</span>
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Santi (Líder) dice:</span>
                        <p className="text-xs text-slate-300 italic leading-relaxed mt-1">
                          "{hm.commentary}"
                        </p>
                      </div>
                    </div>

                    {/* Coworker comments thread */}
                    <div className="mt-4 pt-3 border-t border-[#5B5FC7]/10 space-y-3">
                      <span className="text-[10px] font-bold text-[#3CDBC0] uppercase tracking-wider block">
                        Comentarios de la Oficina ({ (matchComments[hm.id] || []).length })
                      </span>

                      { (matchComments[hm.id] || []).length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {(matchComments[hm.id] || []).map((c, i) => (
                            <div key={i} className="bg-[#0b111a]/60 border border-[#5B5FC7]/5 p-2.5 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-300">{c.from}</span>
                                <span className="text-slate-600 font-mono">
                                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-relaxed font-medium">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">Nadie opinó de este partido en la oficina todavía. ¡Sé el primero!</p>
                      )}

                      {/* Add comment input */}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={commentInputs[hm.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [hm.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && postComment(hm.id)}
                          placeholder="Sumá tu comentario o picanteá al grupo..."
                          className="flex-1 bg-[#050512] border border-[#5B5FC7]/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3CDBC0]/40 transition-colors"
                        />
                        <button
                          onClick={() => postComment(hm.id)}
                          className="bg-[#3CDBC0] hover:bg-[#3CDBC0]/95 text-[#0f0f23] font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Click hint */}
                <div className={`text-center pb-2 transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-[9px] text-slate-600 flex items-center justify-center gap-1">
                    Toca para ver análisis <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════ HEAD TO HEAD SUMMARY ═══════════ */}
      <div className="glass rounded-2xl p-5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-amber-500/5 pointer-events-none" />

        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 relative z-10">
          <Award className="w-4 h-4 text-[#F4C430]" /> Head to Head — Resumen
        </h3>

        <div className="grid grid-cols-3 gap-4 relative z-10">
          {/* Bot side */}
          <div className="text-center">
            <div className="text-3xl mb-1">👨‍💻</div>
            <div className="text-2xl font-extrabold text-cyan-400 tabular-nums">{totalBotPoints}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Santi (Dev)</div>
            <div className="mt-2 text-[10px] text-slate-500">
              {botExactHits} exacto{botExactHits !== 1 ? 's' : ''}
            </div>
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1a2e] border-2 border-[#5B5FC7]/30 flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-[#F4C430]" />
            </div>
            <span className="text-xs font-bold text-slate-400">VS</span>
            <span className="text-[10px] text-slate-600 mt-1">{totalMatches} partidos</span>
          </div>

          {/* Human side */}
          <div className="text-center">
            <div className="text-3xl mb-1">👩‍💼</div>
            <div className="text-2xl font-extrabold text-amber-400 tabular-nums">{totalHumanPoints}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Flor (Sales)</div>
            <div className="mt-2 text-[10px] text-slate-500">
              {humanExactHits} exacto{humanExactHits !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Winner banner */}
        <div className={`mt-4 text-center py-2 rounded-xl border ${
          totalHumanPoints > totalBotPoints
            ? 'bg-amber-500/10 border-amber-500/20'
            : totalBotPoints > totalHumanPoints
            ? 'bg-cyan-500/10 border-cyan-500/20'
            : 'bg-slate-500/10 border-slate-500/20'
        }`}>
          <span className={`text-xs font-bold ${
            totalHumanPoints > totalBotPoints
              ? 'text-amber-400'
              : totalBotPoints > totalHumanPoints
              ? 'text-cyan-400'
              : 'text-slate-400'
          }`}>
            {totalHumanPoints > totalBotPoints
              ? '🎉 ¡Flor lidera el histórico!'
              : totalBotPoints > totalHumanPoints
              ? '🏆 Santi domina el histórico'
              : '🤝 ¡Empate perfecto!'}
          </span>
        </div>
      </div>

      {/* ═══════════ TRIVIA SECTION ═══════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Star className="w-4 h-4 text-[#F4C430]" />
          <h3 className="font-bold text-white text-sm">¿Sabías que...?</h3>
          <span className="text-[10px] text-slate-500 ml-auto">
            {triviaIndex + 1}/{TRIVIA_CARDS.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRIVIA_CARDS.map((trivia, idx) => (
            <div
              key={idx}
              className={`glass rounded-xl p-4 border ${trivia.border} bg-gradient-to-br ${trivia.color} transition-all duration-500 hover:scale-[1.02] ${
                idx === triviaIndex ? 'ring-1 ring-white/10 shadow-lg' : ''
              }`}
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

      {/* ═══════════ REGLAMENTO RÁPIDO ═══════════ */}
      <div className="glass rounded-2xl p-5 border-[#5B5FC7]/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-[#3CDBC0]" /> Reglas del Prode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-[#0a0a1e] rounded-xl p-3 border border-emerald-500/10">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Resultado Exacto
            </div>
            <p className="text-slate-400 leading-relaxed">Acertás el marcador exacto → <strong className="text-emerald-400">4 puntos</strong></p>
          </div>
          <div className="bg-[#0a0a1e] rounded-xl p-3 border border-amber-500/10">
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Tendencia
            </div>
            <p className="text-slate-400 leading-relaxed">Acertás ganador o empate → <strong className="text-amber-400">2 puntos</strong></p>
          </div>
          <div className="bg-[#0a0a1e] rounded-xl p-3 border border-red-500/10">
            <div className="text-red-400 font-bold mb-1 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Fallo
            </div>
            <p className="text-slate-400 leading-relaxed">No acertás ni tendencia → <strong className="text-red-400">0 puntos</strong></p>
          </div>
        </div>
      </div>

    </div>
  );
}
