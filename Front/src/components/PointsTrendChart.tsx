/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Users, Bot, Sparkles, HelpCircle } from 'lucide-react';

interface TrendNode {
  fecha: string;
  longLabel: string;
  oracle: number;
  humanos: number;
  comentario: string;
}

const HISTORICAL_TREND: TrendNode[] = [
  { 
    fecha: 'Fecha -4', 
    longLabel: 'Hace 4 Fechas',
    oracle: 2, 
    humanos: 3, 
    comentario: 'Arranque parejo con pocos goles. Probamos modelos de regresión lineal.' 
  },
  { 
    fecha: 'Fecha -3', 
    longLabel: 'Hace 3 Fechas',
    oracle: 5, 
    humanos: 4, 
    comentario: 'La IA metió un pleno exacto y se adueñó de la punta corporativa.' 
  },
  { 
    fecha: 'Fecha -2', 
    longLabel: 'Hace 2 Fechas',
    oracle: 6, 
    humanos: 8, 
    comentario: 'Santi del Backend clavó 3 puntajes ideales seguidos. Locura absoluta.' 
  },
  { 
    fecha: 'Fecha -1', 
    longLabel: 'Hace 1 Fecha',
    oracle: 8, 
    humanos: 10, 
    comentario: 'Mantenemos distancia corta con empates de bajo perfil estadístico.' 
  },
  { 
    fecha: 'Fecha 0', 
    longLabel: 'Fecha de Práctica',
    oracle: 10, 
    humanos: 12, 
    comentario: 'Último test de simulación antes del arranque del fixture mundialista.' 
  },
];

export default function PointsTrendChart() {
  const [selectedIndex, setSelectedIndex] = useState<number>(4);

  // SVG Dimension setups
  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Max value scale is 14 points
  const maxVal = 14;

  const getCoordinates = (index: number, points: number) => {
    const x = paddingLeft + (index * (chartWidth / (HISTORICAL_TREND.length - 1)));
    const y = height - paddingBottom - (points / maxVal) * chartHeight;
    return { x, y };
  };

  // Compile coordinate string paths
  const oraclePoints = HISTORICAL_TREND.map((d, i) => getCoordinates(i, d.oracle));
  const humanPoints = HISTORICAL_TREND.map((d, i) => getCoordinates(i, d.humanos));

  const oraclePathString = oraclePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const humanPathString = humanPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient area points string paths
  const oracleAreaString = `${oraclePathString} L ${oraclePoints[oraclePoints.length - 1].x} ${height - paddingBottom} L ${oraclePoints[0].x} ${height - paddingBottom} Z`;
  const humanAreaString = `${humanPathString} L ${humanPoints[humanPoints.length - 1].x} ${height - paddingBottom} L ${humanPoints[0].x} ${height - paddingBottom} Z`;

  const selectedNode = HISTORICAL_TREND[selectedIndex];

  return (
    <div className="bg-[#0b111a]/85 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
      {/* Chart Mini Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-850">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-display font-medium text-sm text-slate-100">Tendencia de Puntajes Acumulados</h3>
            <p className="text-3xs text-slate-500 font-mono uppercase tracking-tight">Evolución de últimas 5 fechas históricas</p>
          </div>
        </div>

        {/* Custom Interactive Click hint */}
        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> Haz clic en los nodos para analizar
        </span>
      </div>

      {/* SVG Container with absolute viewport alignment */}
      <div className="relative bg-slate-950/60 border border-slate-850 p-2.5 rounded-2xl">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Definitions for gorgeous area gradients */}
          <defs>
            <linearGradient id="oracleAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="humanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            {/* Filter for glowing effects */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.4" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 2.5, 5, 7.5, 10, 12.5].map((gridPoints) => {
            const y = height - paddingBottom - (gridPoints / maxVal) * chartHeight;
            return (
              <g key={gridPoints} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[9px] font-bold"
                >
                  {gridPoints * 1}
                </text>
              </g>
            );
          })}

          {/* Vertical Match Day columns background hover guides */}
          {HISTORICAL_TREND.map((d, i) => {
            const x = paddingLeft + (i * (chartWidth / (HISTORICAL_TREND.length - 1)));
            const isSelected = i === selectedIndex;
            return (
              <g key={i} className="cursor-pointer" onClick={() => setSelectedIndex(i)}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  className={`transition-all duration-300 ${isSelected ? 'stroke-cyan-500/40 stroke-2' : 'stroke-slate-800/20'}`}
                  strokeWidth="1"
                  strokeDasharray={isSelected ? 'none' : '2 2'}
                />
                {/* Visual hot target capture columns */}
                <rect
                  x={x - 25}
                  y={paddingTop}
                  width="50"
                  height={chartHeight}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* Draw filled helper path areas first */}
          <path d={oracleAreaString} fill="url(#oracleAreaGrad)" />
          <path d={humanAreaString} fill="url(#humanAreaGrad)" />

          {/* Draw Trend Lines */}
          <path
            d={humanPathString}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-amber)"
          />

          <path
            d={oraclePathString}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-cyan)"
          />

          {/* Data Nodes Interactive circles for Humans */}
          {humanPoints.map((p, i) => {
            const isSelected = i === selectedIndex;
            return (
              <circle
                key={`h-${i}`}
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4}
                className={`cursor-pointer transition-all ${isSelected ? 'fill-amber-400 stroke-[#0c1017] stroke-2.5' : 'fill-[#0c1017] stroke-amber-500 stroke-1.5 hover:fill-amber-500/40 hover:r-5'}`}
                onClick={() => setSelectedIndex(i)}
              />
            );
          })}

          {/* Data Nodes Interactive circles for Oracle */}
          {oraclePoints.map((p, i) => {
            const isSelected = i === selectedIndex;
            return (
              <circle
                key={`o-${i}`}
                cx={p.x}
                cy={p.y}
                r={isSelected ? 7 : 4.5}
                className={`cursor-pointer transition-all ${isSelected ? 'fill-cyan-400 stroke-[#0c1017] stroke-3 animate-pulse' : 'fill-[#0c1017] stroke-cyan-400 stroke-2 hover:fill-cyan-400/40 hover:r-5.5'}`}
                onClick={() => setSelectedIndex(i)}
              />
            );
          })}

          {/* Match Day x axis label ticks */}
          {HISTORICAL_TREND.map((d, i) => {
            const x = paddingLeft + (i * (chartWidth / (HISTORICAL_TREND.length - 1)));
            const isSelected = i === selectedIndex;
            return (
              <text
                key={`lbl-${i}`}
                x={x}
                y={height - 20}
                textAnchor="middle"
                className={`transition-all font-mono text-[9px] font-bold cursor-pointer ${isSelected ? 'fill-cyan-400 scale-105' : 'fill-slate-500'}`}
                onClick={() => setSelectedIndex(i)}
              >
                {d.fecha}
              </text>
            );
          })}
        </svg>

        {/* Legend float in chart */}
        <div className="absolute top-2.5 left-4 flex gap-4.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-850/60 font-mono text-3xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="text-slate-300 font-medium">Oracle Bot (IA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-slate-300 font-medium">Colaboradores</span>
          </div>
        </div>
      </div>

      {/* Selected Node Detailed card */}
      <div className="bg-[#121926]/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
        {/* Scoreboard visual */}
        <div className="flex items-center justify-center gap-3 shrink-0 bg-slate-950 rounded-xl p-3 border border-slate-850 w-full sm:w-auto h-20 min-w-[170px]">
          <div className="text-center flex-1">
            <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold block">Bot</span>
            <span className="font-display font-black text-2xl text-white">{selectedNode.oracle}</span>
            <span className="text-4xs text-slate-500 font-mono block">puntos</span>
          </div>
          <div className="text-slate-700 font-bold text-center select-none text-sm">-vs-</div>
          <div className="text-center flex-1">
            <span className="text-[9px] font-mono uppercase text-amber-500 font-bold block">Humans</span>
            <span className="font-display font-black text-2xl text-white">{selectedNode.humanos}</span>
            <span className="text-4xs text-slate-500 font-mono block">puntos</span>
          </div>
        </div>

        {/* Dynamic commentary descriptive section */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-white font-display">
              Detalle en {selectedNode.longLabel}
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
              selectedNode.oracle > selectedNode.humanos 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : selectedNode.humanos > selectedNode.oracle
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'
            }`}>
              {selectedNode.oracle > selectedNode.humanos ? 'IA Ganadora' : selectedNode.humanos > selectedNode.oracle ? 'Humanos Arriba' : 'Empate'}
            </span>
          </div>
          <p className="text-2xs md:text-xs text-slate-350 italic leading-relaxed">
            <strong className="text-cyan-400 not-italic">The Oracle dice: </strong>
            "{selectedNode.comentario}"
          </p>
        </div>
      </div>
    </div>
  );
}
