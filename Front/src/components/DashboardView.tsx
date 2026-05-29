/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Match, StandingsEntry } from '../types';
import { Target, CheckCircle, TrendingUp, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateMatchPoints } from '../utils/points';
import ArgentinaMap from './ArgentinaMap';

interface DashboardViewProps {
  matches: Match[];
  standings: StandingsEntry[];
  officialResults: Record<string, [number, number]>;
  onNavigateToTab: (tabId: string) => void;
}

export default function DashboardView({ matches, standings, officialResults, onNavigateToTab }: DashboardViewProps) {
  const { user } = useAuth();
  
  const totalMatches = matches.length;

  // Calculate stats for the current logged-in user using their own predictions from matches state
  // (matches state is already merged with the current user's predictions from DB in App.tsx)
  const userStats = useMemo(() => {
    let points = 0;
    let acertados = 0;
    let errados = 0;

    matches.forEach(m => {
      const real = officialResults[m.id];
      if (real && m.hasPrediction) {
        const pts = calculateMatchPoints(m.prediction, real);
        points += pts;
        if (pts > 0) {
          acertados += 1;
        } else {
          errados += 1;
        }
      }
    });

    // Cross-check with standings entry for this user (source of truth from DB)
    const myStanding = user ? standings.find(s => s.id === user.id) : null;
    return {
      points: myStanding ? myStanding.points : points,
      acertados,
      errados
    };
  }, [matches, officialResults, standings, user]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Hero Banner with celebration image */}
      <div className="rounded-3xl overflow-hidden relative shadow-2xl shadow-[#5B5FC7]/20 border border-[#5B5FC7]/50 min-h-[280px] sm:min-h-[320px] flex items-center" onClick={() => onNavigateToTab('perfil')} style={{ cursor: 'pointer' }}>
        <div className="absolute inset-0 bg-[#5B5FC7]"></div>
        
        <img 
          src="/argentina-campeon-2026.png" 
          alt="Argentina Campeón 2026" 
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-[#0f0f23]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B5FC7]/80 to-transparent" />

        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 py-10">
          <div className="flex gap-1 mb-4">
            <span className="text-xl drop-shadow-[0_2px_5px_rgba(244,196,48,0.5)]">⭐</span>
            <span className="text-2xl drop-shadow-[0_2px_8px_rgba(244,196,48,0.7)] -mt-1">⭐</span>
            <span className="text-xl drop-shadow-[0_2px_5px_rgba(244,196,48,0.5)]">⭐</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
            🏆 Mundial 2026
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
            ¡Bienvenido al Prode <span className="text-[#3CDBC0] drop-shadow-[0_2px_10px_rgba(60,219,192,0.4)]">MagIA</span>!
          </h2>
          <p className="text-slate-200 max-w-xl text-sm sm:text-base font-medium drop-shadow-md">
            Competí con tus compañeros pronosticando los resultados del Mundial.
          </p>
        </div>
      </div>

      {/* Dynamic Stats Row showing user statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-white">{totalMatches}</span>
          <span className="block text-xs text-slate-400 mt-1">Partidos</span>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-[#3CDBC0]">{userStats.points}</span>
          <span className="block text-xs text-slate-400 mt-1">Tus Puntos</span>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-[#F4C430]">{userStats.acertados}</span>
          <span className="block text-xs text-slate-400 mt-1">Acertados</span>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-red-400">{userStats.errados}</span>
          <span className="block text-xs text-slate-400 mt-1">Errados</span>
        </div>
      </div>

      {/* Interactive Argentina Map component replacing navigation cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm px-1">Distribución de Jugadores por Provincia</h3>
        <ArgentinaMap standings={standings} />
      </div>

      {/* Rules of Prode relocated to home screen */}
      <div className="glass rounded-2xl p-5 border-[#5B5FC7]/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-[#3CDBC0]" /> Reglas del Prode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-[#0a0a1e] rounded-xl p-3 border border-amber-500/10">
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Tendencia
            </div>
            <p className="text-slate-400 leading-relaxed">Acertás ganador o empate → <strong className="text-amber-400">3 puntos</strong></p>
          </div>
          <div className="bg-[#0a0a1e] rounded-xl p-3 border border-cyan-500/10">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Goles por Equipo
            </div>
            <p className="text-slate-400 leading-relaxed">Acertás goles del local y/o del visitante → <strong className="text-cyan-400">+1 punto c/u</strong></p>
          </div>
          <div className="bg-[#0a0a1e] rounded-xl p-3 border border-emerald-500/10">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Resultado Exacto
            </div>
            <p className="text-slate-400 leading-relaxed font-semibold">Marcador exacto completo → <strong className="text-emerald-400">5 puntos</strong></p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
