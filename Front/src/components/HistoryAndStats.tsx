/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StandingsEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Calendar, Trophy, Sparkles, TrendingUp, Zap,
  CheckCircle, XCircle, Star, Globe, Timer, Award, MessageSquare, Send
} from 'lucide-react';

interface HistoryAndStatsProps {
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

export default function HistoryAndStats({ standings = [] }: HistoryAndStatsProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ id: string; from: string; text: string; created_at: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [triviaIndex, setTriviaIndex] = useState(0);

  const leader = standings[0]?.name || '—';
  const runnerUp = standings[1]?.name || '—';
  const totalPlayers = standings.length;
  const totalPoints = standings.reduce((acc, s) => acc + s.points, 0);
  const topScore = standings[0]?.points ?? 0;

  // Fetch chat messages
  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel('public:messages_history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !user) return;
    await supabase.from('messages').insert({
      text,
      from: user.name || 'Usuario',
      created_at: new Date().toISOString()
    });
    setNewMessage('');
    fetchMessages();
  };

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
      fact: `${leader} y ${runnerUp} vienen cabeza a cabeza por el liderazgo del Prode.`,
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

  const animTopScore = useAnimatedCounter(topScore);
  const animTotal = useAnimatedCounter(totalPlayers);
  const animTotalPts = useAnimatedCounter(totalPoints);

  const renderAvatar = (avatar: string | undefined, size: string = 'w-8 h-8 text-lg') => {
    if (avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.length > 8)) {
      return <img src={avatar} className={`${size} rounded-full object-cover select-none shrink-0`} alt="Avatar" />;
    }
    return <span className={`${size} flex items-center justify-center select-none shrink-0`}>{avatar || '⚽'}</span>;
  };

  const podiumColors = [
    { ring: 'ring-[#F4C430]', text: 'text-[#F4C430]', bg: 'bg-[#F4C430]/10', label: '🥇' },
    { ring: 'ring-slate-400', text: 'text-slate-300', bg: 'bg-slate-700/20', label: '🥈' },
    { ring: 'ring-amber-700', text: 'text-amber-700', bg: 'bg-amber-900/10', label: '🥉' },
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
        <div className="glass rounded-2xl p-5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4C430]/5 via-transparent to-[#3CDBC0]/5 pointer-events-none" />

          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5 relative z-10">
            <Award className="w-4 h-4 text-[#F4C430]" /> Podio Actual
          </h3>

          <div className="flex items-end justify-center gap-3 relative z-10">
            {/* Ordenamos para mostrar 2°, 1°, 3° visualmente */}
            {[standings[1], standings[0], standings[2]].map((player, visualPos) => {
              if (!player) return <div key={visualPos} className="flex-1" />;
              const rankIndex = visualPos === 0 ? 1 : visualPos === 1 ? 0 : 2;
              const col = podiumColors[rankIndex];
              const heights = ['h-20', 'h-28', 'h-16'];
              return (
                <div key={player.id} className="flex-1 flex flex-col items-center gap-2 max-w-[140px]">
                  <div className="text-lg">{col.label}</div>
                  <div className={`w-12 h-12 rounded-full ring-2 ${col.ring} overflow-hidden flex items-center justify-center bg-[#1a1a2e]`}>
                    {renderAvatar(player.avatar, 'w-12 h-12 text-xl')}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white truncate max-w-[120px]">{player.name}</div>
                    <div className={`text-lg font-extrabold ${col.text} tabular-nums`}>{player.points} pts</div>
                  </div>
                  <div className={`w-full ${heights[visualPos]} ${col.bg} border ${col.ring.replace('ring', 'border')}/30 rounded-t-xl`} />
                </div>
              );
            })}
          </div>

          {/* Rest of standings */}
          {standings.length > 3 && (
            <div className="mt-5 space-y-2 border-t border-[#5B5FC7]/10 pt-4">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Resto de la tabla</div>
              {standings.slice(3).map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between bg-[#0f0f23]/40 rounded-xl px-3 py-2 border border-[#5B5FC7]/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500 w-5 font-bold">{idx + 4}°</span>
                    {renderAvatar(player.avatar, 'w-6 h-6 text-sm')}
                    <span className="text-xs text-slate-300 truncate">{player.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{player.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ CHAT DE OFICINA ═══════════ */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-[#3CDBC0]" />
          <h3 className="font-bold text-white text-sm">Chat de la Oficina</h3>
          <span className="text-[10px] text-slate-500 font-mono ml-auto">{messages.length} mensajes</span>
        </div>

        {/* Messages */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-none">
          {messages.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic text-center py-4">
              Nadie escribió nada todavía. ¡Sé el primero!
            </p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.from === user?.name ? 'flex-row-reverse' : ''}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs border ${
                  msg.from === user?.name
                    ? 'bg-[#3CDBC0]/10 border-[#3CDBC0]/20 text-white'
                    : 'bg-[#0f0f23]/60 border-[#5B5FC7]/10 text-slate-300'
                }`}>
                  <div className={`text-[9px] font-bold mb-0.5 ${msg.from === user?.name ? 'text-[#3CDBC0] text-right' : 'text-slate-500'}`}>
                    {msg.from}
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t border-[#5B5FC7]/10">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Escribí algo al grupo..."
            className="flex-1 bg-[#050512] border border-[#5B5FC7]/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#3CDBC0]/40 transition-colors"
          />
          <button
            onClick={sendMessage}
            className="bg-[#3CDBC0] hover:bg-[#3CDBC0]/90 text-[#0f0f23] font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
          </button>
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
    </div>
  );
}
