/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match } from '../types';
import { calculateGroupStandings, GroupTeam, GroupLetter } from '../utils/standings';
import { Trophy, Compass, Star, ChevronRight } from 'lucide-react';

interface GroupStandingsWidgetProps {
  matches: Match[];
}

export default function GroupStandingsWidget({ matches }: GroupStandingsWidgetProps) {
  const [activeGroup, setActiveGroup] = useState<GroupLetter>('A');

  const groupsList: { letter: GroupLetter; label: string; desc: string }[] = [
    { letter: 'A', label: 'Grupo A', desc: 'México, Sudáfrica, República de Corea, Chequia' },
    { letter: 'B', label: 'Grupo B', desc: 'Canadá, Bosnia y Herzegovina, Catar, Suiza' },
    { letter: 'C', label: 'Grupo C', desc: 'Brasil, Marruecos, Haití, Escocia' },
    { letter: 'D', label: 'Grupo D', desc: 'EE. UU., Paraguay, Australia, Turquía' },
    { letter: 'E', label: 'Grupo E', desc: 'Alemania, Curazao, Costa de Marfil, Ecuador' },
    { letter: 'F', label: 'Grupo F', desc: 'Países Bajos, Japón, Suecia, Túnez' },
    { letter: 'G', label: 'Grupo G', desc: 'Bélgica, Egipto, RI de Irán, Nueva Zelanda' },
    { letter: 'H', label: 'Grupo H', desc: 'España, Islas de Cabo Verde, Arabia Saudí, Uruguay' },
    { letter: 'I', label: 'Grupo I', desc: 'Francia, Senegal, Irak, Noruega' },
    { letter: 'J', label: 'Grupo J', desc: 'Argentina, Argelia, Austria, Jordania' },
    { letter: 'K', label: 'Grupo K', desc: 'Portugal, RD Congo, Uzbekistán, Colombia' },
    { letter: 'L', label: 'Grupo L', desc: 'Inglaterra, Croacia, Ghana, Panamá' },
  ];

  const standings = calculateGroupStandings(matches, activeGroup);

  return (
    <div className="bg-[#0b111a]/85 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100">Posiciones de Grupos en Tiempo Real</h3>
            <p className="text-3xs text-slate-400 font-mono uppercase tracking-tight">Cambia los partidos para ver cómo evoluciona la tabla</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-950 text-amber-400 border border-slate-800/80 px-2.5 py-0.5 rounded font-mono">
          Simulador Activo ⚙️
        </span>
      </div>

      {/* Selected Group Description */}
      <div className="bg-[#05080d] p-3 rounded-xl border border-slate-900 flex justify-between items-center">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block">Grupo Seleccionado</span>
          <p className="text-xs text-slate-200 font-bold">{groupsList.find(g => g.letter === activeGroup)?.label}: {groupsList.find(g => g.letter === activeGroup)?.desc}</p>
        </div>
        <span className="text-sm">🏆</span>
      </div>

      {/* Group selectors */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900">
        {groupsList.map((g) => {
          const isActive = activeGroup === g.letter;
          return (
            <button
              key={g.letter}
              onClick={() => setActiveGroup(g.letter)}
              className={`py-2 px-0.5 text-center rounded-lg font-display text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              {g.letter}
            </button>
          );
        })}
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/40">
        <table className="w-full border-collapse text-left text-xs font-mono">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-850 text-[9px] uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-3 text-center w-8">#</th>
              <th className="py-2.5 px-3">Equipo</th>
              <th className="py-2.5 px-2 text-center w-10">PJ</th>
              <th className="py-2.5 px-2 text-center w-10">PG</th>
              <th className="py-2.5 px-2 text-center w-10">PE</th>
              <th className="py-2.5 px-2 text-center w-10">PP</th>
              <th className="py-2.5 px-3 text-center w-14">GF:GC</th>
              <th className="py-2.5 px-3 text-center w-10">DG</th>
              <th className="py-2.5 px-4 text-center w-14 bg-cyan-950/10 font-bold text-cyan-400">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {standings.map((team, idx) => {
              const isQualified = idx < 2; // Top 2 advance

              return (
                <tr 
                  key={team.code} 
                  className={`hover:bg-slate-900/20 transition-all ${
                    isQualified ? 'bg-gradient-to-r from-cyan-950/5 via-transparent to-transparent' : ''
                  }`}
                >
                  {/* Position number */}
                  <td className="py-3 px-3 text-center font-bold font-mono">
                    <span className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded text-2xs ${
                      isQualified 
                        ? idx === 0 
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' 
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'bg-slate-905 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>

                  {/* Team Identifier with flag */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl select-none drop-shadow-sm">{team.flag}</span>
                      <div className="leading-tight">
                        <span className="font-display font-bold text-slate-100 block sm:hidden">
                          {team.code}
                        </span>
                        <span className="font-display font-medium text-slate-100 hidden sm:inline">
                          {team.name}
                        </span>
                        {isQualified && (
                          <span className="text-[8px] text-cyan-400 font-mono block tracking-tight uppercase">
                            {idx === 0 ? 'Puntero' : 'Clasificado'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Played */}
                  <td className="py-3 px-2 text-center text-slate-350">{team.played}</td>
                  {/* Won */}
                  <td className="py-3 px-2 text-center text-slate-300 font-medium">{team.won}</td>
                  {/* Drawn */}
                  <td className="py-3 px-2 text-center text-slate-400">{team.drawn}</td>
                  {/* Lost */}
                  <td className="py-3 px-2 text-center text-slate-550">{team.lost}</td>

                  {/* Goals For : Against */}
                  <td className="py-3 px-3 text-center text-slate-400">
                    {team.gf}:{team.ga}
                  </td>

                  {/* Goal Difference column */}
                  <td className={`py-3 px-3 text-center font-bold ${
                    team.gd > 0 
                      ? 'text-emerald-400' 
                      : team.gd < 0 
                        ? 'text-red-400/90' 
                        : 'text-slate-500'
                  }`}>
                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                  </td>

                  {/* Total points */}
                  <td className="py-3 px-4 text-center bg-cyan-950/15 font-black text-white text-sm border-l border-cyan-950/40">
                    {team.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Tip */}
      <p className="text-3xs text-slate-500 text-center leading-relaxed">
        Las posiciones reglamentarias se basan en criterios oficiales FIFA: Puntos -&gt; Diferencia de Gol (DG) -&gt; Goles Convertidos (GF). Modifica los goles en el panel de partidos para ver saltar de posición a tus selecciones preferidas.
      </p>
    </div>
  );
}
