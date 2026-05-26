/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Users, Bot, ChevronUp, AlertCircle } from 'lucide-react';
import { StandingsEntry } from '../types';

interface StandingsTableProps {
  standings: StandingsEntry[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  // Humans vs Bot calculations
  const humans = standings.find(s => !s.isBot);
  const bot = standings.find(s => s.isBot);
  const diff = (humans?.points || 0) - (bot?.points || 0);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4.5">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            <h2 className="font-display font-bold text-lg text-white">Tabla de Posiciones</h2>
          </div>
          <span className="font-mono text-xs text-slate-500">Temporada actual</span>
        </div>

        {/* Comparison scoreboard UI */}
        <div className="space-y-4">
          {standings.map((entry, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={entry.id}
                className={`relative overflow-hidden flex items-center justify-between p-4.5 rounded-xl border transition-all duration-300 ${
                  entry.isBot
                    ? 'bg-cyan-950/20 border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/30 border-slate-800'
                }`}
              >
                {/* Visual rank indicator */}
                <div className="flex items-center gap-3.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-extrabold text-sm ${
                    isFirst 
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-505/20'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      {entry.avatar && (entry.avatar.startsWith('data:image/') || entry.avatar.startsWith('http') || entry.avatar.length > 8) ? (
                        <img src={entry.avatar} className="w-5 h-5 rounded object-cover select-none shrink-0" alt="Avatar" />
                      ) : (
                        <span className="text-xl shrink-0 select-none">{entry.avatar || '⚽'}</span>
                      )}
                      <span className={`font-semibold text-sm ${isFirst ? 'text-white' : 'text-slate-200'}`}>
                        {entry.name}
                      </span>
                    </div>
                    {entry.isBot ? (
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/10 px-1.5 py-0.2 rounded font-mono font-medium block w-max mt-0.5 animate-pulse">
                        Desafiante deportivo
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        Promedio de la oficina
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right z-10">
                  <span className={`font-display font-extrabold text-2xl block ${isFirst ? 'text-white' : 'text-slate-300'}`}>
                    {entry.points}
                  </span>
                  <span className="text-2xs uppercase font-mono tracking-wider text-slate-500">puntos</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Gap Visualizer with sports styling */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="bg-[#0b111a] border border-red-500/10 p-4 rounded-xl space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200 block">
                Análisis Técnico de Brackets (-{diff} pts)
              </span>
              <p className="text-slate-400 text-2xs leading-normal">
                Los humanos tienen 2 puntos de margen por la fecha pasada. Para recortar esta ventaja, no podemos mandar predicciones tibias. Copiar la tendencia general nos condena al segundo puesto. ¡Se requiere tomar riesgos (empate en México)!
              </p>
            </div>
          </div>

          {/* Graphical gauge chart to show the 2 pts gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-3xs font-mono text-slate-500 uppercase tracking-wider">
              <span>Oracle (10)</span>
              <span>Gap (-2)</span>
              <span>Humanos (12)</span>
            </div>
            <div className="h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div className="h-full flex rounded-full overflow-hidden">
                {/* Bot score segment */}
                <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" style={{ width: '70%' }} />
                {/* Gap segment (orange-red) */}
                <div className="h-full bg-gradient-to-r from-red-500/80 to-amber-500/80 animate-pulse transition-all duration-500" style={{ width: '15%' }} />
                {/* Rest space */}
                <div className="h-full bg-slate-900" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a7.7 7.7 0 0 1 7.54 8H4.46A7.7 7.7 0 0 1 12 2Z" />
    </svg>
  );
}
