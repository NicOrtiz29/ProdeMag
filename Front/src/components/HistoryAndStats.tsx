/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoricalMatch } from '../types';
import { Calendar, HelpCircle, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import PointsTrendChart from './PointsTrendChart';

interface HistoryAndStatsProps {
  historicalMatches: HistoricalMatch[];
}

export default function HistoryAndStats({ historicalMatches }: HistoryAndStatsProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="font-display font-bold text-lg text-white">Anales Históricos | Fecha de Práctica</h2>
            <p className="text-2xs text-slate-400">Cómo se gestó la ventaja actual de 2 puntos de los humanos</p>
          </div>
        </div>
        <span className="font-mono text-xs bg-slate-950 px-2.5 py-0.5 rounded border border-slate-850 text-slate-400">
          Historial Fecha 0
        </span>
      </div>

      {/* Dynamic Evolution Trend Line Graph */}
      <PointsTrendChart />

      {/* Tabla comparativa de fechas */}
      <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Tabla de Puntajes Acumulados por Jornada
          </h3>
          <p className="text-3xs text-slate-400 font-mono uppercase tracking-tight">
            Análisis detallado de evolución: Oracle Bot vs. Humanos
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-850 rounded-xl bg-[#070b12]">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-3xs uppercase tracking-wider text-slate-450">
                <th className="py-2.5 px-4 font-semibold">Jornada</th>
                <th className="py-2.5 px-4 text-center font-semibold">Oracle Bot (IA)</th>
                <th className="py-2.5 px-4 text-center font-semibold">Colaboradores</th>
                <th className="py-2.5 px-4 text-center font-semibold hidden sm:table-cell">Brecha acumulada</th>
                <th className="py-2.5 px-4 text-right pr-6 font-semibold">Veredicto de Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {[
                { label: 'Fecha -4', botPts: 2, humanPts: 3, winner: 'humanos' },
                { label: 'Fecha -3', botPts: 5, humanPts: 4, winner: 'bot' },
                { label: 'Fecha -2', botPts: 6, humanPts: 8, winner: 'humanos' },
                { label: 'Fecha -1', botPts: 8, humanPts: 10, winner: 'humanos' },
                { label: 'Fecha 0 (Práctica)', botPts: 10, humanPts: 12, winner: 'humanos' },
              ].map((item, idx) => {
                const isBotWinner = item.winner === 'bot';
                const isHumanWinner = item.winner === 'humanos';
                const pointsDiff = Math.abs(item.humanPts - item.botPts);

                return (
                  <tr key={idx} className="hover:bg-slate-900/20 transition-all font-mono">
                    <td className="py-3 px-4 font-display font-semibold text-slate-300">
                      {item.label}
                    </td>
                    
                    {/* Bot Points with dynamic green background highlight if won */}
                    <td className={`py-3 px-4 text-center font-mono transition-all ${
                      isBotWinner 
                        ? 'bg-emerald-950/20 text-emerald-400 font-extrabold border-x border-emerald-500/10' 
                        : 'text-slate-400'
                    }`}>
                      {item.botPts} pts {isBotWinner && '👑'}
                    </td>

                    {/* Human Points with dynamic green background highlight if won */}
                    <td className={`py-3 px-4 text-center font-mono transition-all ${
                      isHumanWinner 
                        ? 'bg-emerald-950/20 text-emerald-400 font-extrabold border-x border-emerald-500/10' 
                        : 'text-slate-400'
                    }`}>
                      {item.humanPts} pts {isHumanWinner && '👑'}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-500 text-3xs hidden sm:table-cell">
                      {item.humanPts > item.botPts ? `Humanos por +${pointsDiff}` : `Bot por +${pointsDiff}`}
                    </td>

                    {/* Highlighted winner label */}
                    <td className="py-3 px-4 text-right pr-6">
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-4xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        {isBotWinner ? '🟢 IA GANÓ' : '🟢 HUMANOS GANARON'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 p-4.5 rounded-xl space-y-2">
        <h3 className="text-xs font-semibold text-amber-300 font-display flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" /> ¿Qué pasó en la Fecha de Preparación?
        </h3>
        <p className="text-2xs text-slate-350 leading-relaxed">
          The Oracle Bot se enfrentó al promedio de los colaboradores humanos del equipo de tecnología. Aunque acertamos el <strong className="text-white">Resultado Exacto de EE.UU. contra Gales (1-1)</strong> sumando 4 puntos completos, tuvimos baches de calibración táctica en los partidos de prueba. ¡Analicemos de cerca la bitácora deportiva del Bot!
        </p>
      </div>

      {/* Grid of historic matches with analysis */}
      <div className="grid gap-4.5">
        {historicalMatches.map((hm) => {
          const oracleDidBetter = hm.pointsOracle > hm.pointsHuman;
          const humanDidBetter = hm.pointsHuman > hm.pointsOracle;
          const tiedRound = hm.pointsOracle === hm.pointsHuman;

          return (
            <div 
              key={hm.id}
              className="bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl hover:border-slate-800 transition-all duration-300 space-y-3"
            >
              {/* Header metadata row */}
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-white">
                  {hm.matchName}
                </span>

                {/* Score breakdown flags */}
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  oracleDidBetter 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                    : humanDidBetter
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                }`}>
                  {oracleDidBetter ? 'Predicción Superadora IA' : humanDidBetter ? 'Ganaron Humanos' : 'Puntaje Empatado'}
                </span>
              </div>

              {/* Match predictions score simulator mockup card layout */}
              <div className="grid grid-cols-3 gap-2 bg-[#06090e] border border-slate-900 rounded-xl p-3 text-center text-xs font-mono">
                {/* Real Board result */}
                <div className="space-y-1 py-1.5">
                  <span className="text-4xs uppercase text-slate-500 block">Marcador Real</span>
                  <span className="font-display text-base font-extrabold text-white">
                    {hm.realResult[0]} - {hm.realResult[1]}
                  </span>
                  <span className="text-4xs text-slate-500 font-bold block">OFICIAL</span>
                </div>

                {/* Bot Forecasted view */}
                <div className="border-x border-slate-900 px-2 space-y-1 py-1.5 bg-cyan-950/10">
                  <span className="text-4xs uppercase text-cyan-400 block font-semibold">Predicción Bot</span>
                  <span className="font-display text-base font-bold text-cyan-300">
                    {hm.oraclePrediction[0]} - {hm.oraclePrediction[1]}
                  </span>
                  <span className="text-4xs text-cyan-500 font-bold block">
                    +{hm.pointsOracle} pts sumados
                  </span>
                </div>

                {/* Humans forecast view */}
                <div className="space-y-1 py-1.5">
                  <span className="text-4xs uppercase text-amber-500 block font-semibold">Predicción Humano</span>
                  <span className="font-display text-base font-bold text-amber-300">
                    {hm.humanPrediction[0]} - {hm.humanPrediction[1]}
                  </span>
                  <span className="text-4xs text-amber-500/80 font-bold block">
                    +{hm.pointsHuman} pts sumados
                  </span>
                </div>
              </div>

              {/* Laughing explanation commentaries */}
              <div className="text-2xs text-slate-400 bg-slate-900/20 px-3.5 py-2.5 rounded-lg border border-slate-850/40 italic leading-relaxed">
                <span className="text-cyan-400 font-bold not-italic">The Oracle dice: </span>
                "{hm.commentary}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
