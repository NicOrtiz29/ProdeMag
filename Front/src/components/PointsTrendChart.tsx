import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Bot, Sparkles, HelpCircle } from 'lucide-react';
import { StandingsEntry, HistoricalMatch } from '../types';

interface TrendNode {
  fecha: string;
  longLabel: string;
  oracle: number;
  humanos: number;
  comentario: string;
}

const HISTORICAL_TREND: TrendNode[] = [
  { 
    fecha: 'Fecha 1', 
    longLabel: 'Fecha 1',
    oracle: 2, 
    humanos: 3, 
    comentario: 'Arranque parejo en la primera fecha. Ninguno quería regalar nada en la oficina.' 
  },
  { 
    fecha: 'Fecha 2', 
    longLabel: 'Fecha 2',
    oracle: 5, 
    humanos: 4, 
    comentario: 'Santi metió un pleno exacto y se adueñó de la punta corporativa.' 
  },
  { 
    fecha: 'Fecha 3', 
    longLabel: 'Fecha 3',
    oracle: 6, 
    humanos: 8, 
    comentario: 'Santi del Backend clavó 3 puntajes ideales seguidos. ¡Estaba intratable!' 
  },
  { 
    fecha: 'Fecha 4', 
    longLabel: 'Fecha 4',
    oracle: 8, 
    humanos: 10, 
    comentario: 'Flor acorta distancia apostando a empates clave en el fixture.' 
  },
  { 
    fecha: 'Fecha 5', 
    longLabel: 'Fecha 5',
    oracle: 10, 
    humanos: 12, 
    comentario: 'Última fecha de práctica cerrada. Flor queda a solo 2 puntos de Santi.' 
  },
];

interface PointsTrendChartProps {
  standings?: StandingsEntry[];
  historicalMatches?: HistoricalMatch[];
}

export default function PointsTrendChart({ standings = [], historicalMatches = [] }: PointsTrendChartProps) {
  // Build dynamic trend nodes based on historicalMatches if available, otherwise fallback
  const trendData = useMemo(() => {
    if (!historicalMatches || historicalMatches.length === 0) {
      return HISTORICAL_TREND;
    }
    
    let accOracle = 0;
    let accHuman = 0;
    
    return historicalMatches.map((m, idx) => {
      accOracle += m.pointsOracle;
      accHuman += m.pointsHuman;
      return {
        fecha: `Part. ${idx + 1}`,
        longLabel: m.matchName,
        oracle: accOracle,
        humanos: accHuman,
        comentario: m.commentary
      };
    });
  }, [historicalMatches]);

  const [selectedIndexState, setSelectedIndex] = useState<number>(-1);
  const selectedIndex = selectedIndexState === -1 ? trendData.length - 1 : Math.min(selectedIndexState, trendData.length - 1);

  const lastTrendNode = trendData[trendData.length - 1] || { oracle: 0, humanos: 0 };
  const botIsLeader = lastTrendNode.oracle >= lastTrendNode.humanos;
  const botLabel = `Santi (${botIsLeader ? 'Líder' : 'Escolta'})`;
  const humanLabel = `Flor (${botIsLeader ? 'Escolta' : 'Líder'})`;

  // SVG Dimension setups
  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Max value scale is calculated dynamically from the maximum score in trendData, with a fallback of 14 points
  const maxVal = Math.max(14, ...trendData.map(d => Math.max(d.oracle, d.humanos)));

  const getCoordinates = (index: number, points: number) => {
    const x = paddingLeft + (index * (chartWidth / Math.max(1, trendData.length - 1)));
    const y = height - paddingBottom - (points / maxVal) * chartHeight;
    return { x, y };
  };

  // Compile coordinate string paths
  const oraclePoints = trendData.map((d, i) => getCoordinates(i, d.oracle));
  const humanPoints = trendData.map((d, i) => getCoordinates(i, d.humanos));

  const oraclePathString = oraclePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const humanPathString = humanPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient area points string paths
  const oracleAreaString = oraclePoints.length > 0 
    ? `${oraclePathString} L ${oraclePoints[oraclePoints.length - 1].x} ${height - paddingBottom} L ${oraclePoints[0].x} ${height - paddingBottom} Z`
    : '';
  const humanAreaString = humanPoints.length > 0
    ? `${humanPathString} L ${humanPoints[humanPoints.length - 1].x} ${height - paddingBottom} L ${humanPoints[0].x} ${height - paddingBottom} Z`
    : '';

  const selectedNode = trendData[selectedIndex] || { oracle: 0, humanos: 0, longLabel: '', comentario: '' };

  return (
    <div className="bg-[#0b111a]/85 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
      {/* Chart Mini Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-850">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-display font-medium text-sm text-slate-100">Tendencia de Puntajes Acumulados</h3>
            <p className="text-3xs text-slate-500 font-mono uppercase tracking-tight">Evolución de últimos partidos históricos</p>
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
          {Array.from({ length: 6 }).map((_, idx) => {
            const gridPoints = Math.round((maxVal / 5) * idx * 10) / 10;
            const y = height - paddingBottom - (gridPoints / maxVal) * chartHeight;
            return (
              <g key={idx} className="opacity-20">
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
                  {gridPoints}
                </text>
              </g>
            );
          })}

          {/* Vertical Match Day columns background hover guides */}
          {trendData.map((d, i) => {
            const x = paddingLeft + (i * (chartWidth / Math.max(1, trendData.length - 1)));
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
          {oracleAreaString && <path d={oracleAreaString} fill="url(#oracleAreaGrad)" />}
          {humanAreaString && <path d={humanAreaString} fill="url(#humanAreaGrad)" />}

          {/* Draw Trend Lines */}
          {humanPathString && (
            <path
              d={humanPathString}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-amber)"
            />
          )}

          {oraclePathString && (
            <path
              d={oraclePathString}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-cyan)"
            />
          )}

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
          {trendData.map((d, i) => {
            const x = paddingLeft + (i * (chartWidth / Math.max(1, trendData.length - 1)));
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
            <span className="text-slate-300 font-medium">{botLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-slate-300 font-medium">{humanLabel}</span>
          </div>
        </div>
      </div>

      {/* Selected Node Detailed card */}
      <div className="bg-[#121926]/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
        {/* Scoreboard visual */}
        <div className="flex items-center justify-center gap-3 shrink-0 bg-slate-950 rounded-xl p-3 border border-slate-850 w-full sm:w-auto h-20 min-w-[170px]">
          <div className="text-center flex-1">
            <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold block">Santi</span>
            <span className="font-display font-black text-2xl text-white">{selectedNode.oracle}</span>
            <span className="text-4xs text-slate-500 font-mono block">puntos</span>
          </div>
          <div className="text-slate-700 font-bold text-center select-none text-sm">-vs-</div>
          <div className="text-center flex-1">
            <span className="text-[9px] font-mono uppercase text-amber-500 font-bold block">Flor</span>
            <span className="font-display font-black text-2xl text-white">{selectedNode.humanos}</span>
            <span className="text-4xs text-slate-500 font-mono block">puntos</span>
          </div>
        </div>

        {/* Dynamic commentary descriptive section */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-white font-display">
              Detalle: {selectedNode.longLabel}
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
              selectedNode.oracle > selectedNode.humanos 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : selectedNode.humanos > selectedNode.oracle
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'
            }`}>
              {selectedNode.oracle > selectedNode.humanos ? 'Santi Arriba' : selectedNode.humanos > selectedNode.oracle ? 'Flor Arriba' : 'Empate'}
            </span>
          </div>
          <p className="text-2xs md:text-xs text-slate-350 italic leading-relaxed">
            <strong className="text-cyan-400 not-italic">Comentario: </strong>
            "{selectedNode.comentario}"
          </p>
        </div>
      </div>
    </div>
  );
}
