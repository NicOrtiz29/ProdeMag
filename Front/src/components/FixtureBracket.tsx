/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { resolveFixture, ResolvedMatch } from '../utils/fixtureResolver';
import { Match } from '../types';
import { Calendar, Filter, HelpCircle, Trophy } from 'lucide-react';
import { calculateGroupStandings, GroupLetter, GroupTeam } from '../utils/standings';
import { isPredictionOpen } from '../utils/time';

interface FixtureBracketProps {
  matches: Match[];
  officialResults: Record<string, [number, number]>;
  onChangeScore: (id: string, index: 0 | 1, value: number) => void;
}

export default function FixtureBracket({ matches, officialResults, onChangeScore }: FixtureBracketProps) {
  const [viewType, setViewType] = useState<'predicted' | 'official'>('predicted');
  const [activeTab, setActiveTab] = useState<'groups' | 'full' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'>('full');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [localScoreInput, setLocalScoreInput] = useState<number>(0);
  const [visitorScoreInput, setVisitorScoreInput] = useState<number>(0);

  // Click-and-drag panning refs and state (both horizontal and vertical)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid dragging if clicking buttons, links, or cards
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.cursor-pointer')) {
      return;
    }
    // Only drag on full bracket tree
    if (activeTab !== 'full') return;

    setIsDragging(true);
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setStartY(e.pageY - scrollContainerRef.current.offsetTop);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current || activeTab !== 'full') return;
    e.preventDefault();
    
    // Horizontal scroll calculation
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walkX = (x - startX) * 1.5; // Drag speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX;

    // Vertical scroll calculation
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walkY = (y - startY) * 1.5; // Drag speed multiplier
    scrollContainerRef.current.scrollTop = scrollTop - walkY;
  };

  // Compute resolved tournament matches
  const resolvedMatches = useMemo(() => {
    return resolveFixture(matches, viewType === 'official', officialResults);
  }, [matches, viewType, officialResults]);

  const matchMap = useMemo(() => {
    const map: Record<string, ResolvedMatch> = {};
    resolvedMatches.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [resolvedMatches]);

  const openEditModal = (match: ResolvedMatch) => {
    if (viewType === 'official') return; // Can't edit official results here
    if (!isPredictionOpen(match as any)) return; // Can't edit if prediction is closed
    setEditingMatchId(match.id);
    setLocalScoreInput(match.prediction[0]);
    setVisitorScoreInput(match.prediction[1]);
  };

  const savePrediction = () => {
    if (editingMatchId) {
      onChangeScore(editingMatchId, 0, localScoreInput);
      onChangeScore(editingMatchId, 1, visitorScoreInput);
      setEditingMatchId(null);
    }
  };

  // Helper to format match date
  const getMatchDate = (fechaNum: number): string => {
    const dates: Record<number, string> = {
      73: '28/6 - LA', 74: '29/6 - Boston', 75: '29/6 - Monterrey', 76: '30/6 - NY',
      77: '30/6 - Dallas', 78: '1/7 - Atlanta', 79: '1/7 - SF Bay', 80: '2/7 - Toronto',
      81: '2/7 - Miami', 82: '3/7 - Dallas', 83: '3/7 - Kansas', 84: '4/7 - Seattle',
      85: '4/7 - Houston', 86: '5/7 - CDMX', 87: '5/7 - Vancou', 88: '6/7 - Orlando',
      89: '4/7 - Philadel', 90: '4/7 - Houston', 91: '5/7 - CDMX', 92: '5/7 - Atlanta',
      93: '6/7 - Dallas', 94: '6/7 - Seattle', 95: '7/7 - Atlanta', 96: '7/7 - Vancou',
      97: '9/7 - Boston', 98: '9/7 - Miami', 99: '10/7 - LA', 100: '11/7 - Kansas',
      101: '14/7 - Dallas', 102: '15/7 - Atlanta', 103: '18/7 - Miami', 104: '19/7 - NY'
    };
    return dates[fechaNum] || `Fecha ${fechaNum}`;
  };

  // Helper to render a bracket node
  const renderMatchNode = (matchId: string) => {
    const match = matchMap[matchId];
    if (!match) return null;

    const localScore = viewType === 'official' ? (officialResults[match.id]?.[0] ?? '-') : match.prediction[0];
    const visitorScore = viewType === 'official' ? (officialResults[match.id]?.[1] ?? '-') : match.prediction[1];

    const hasTeams = match.resolvedLocal && match.resolvedVisitor;
    const isWinnerLocal = hasTeams && (localScore > visitorScore || (localScore === visitorScore && match.winnerId === 'local'));
    const isWinnerVisitor = hasTeams && (visitorScore > localScore || (localScore === visitorScore && match.winnerId === 'visitor'));

    const isLocked = viewType !== 'official' && !isPredictionOpen(match as any);

    return (
      <div 
        onClick={() => openEditModal(match)}
        className={`w-[190px] bg-[#1a1a2e]/90 border ${
          editingMatchId === match.id 
            ? 'border-[#3CDBC0] shadow-[0_0_12px_rgba(60,219,192,0.3)]' 
            : isLocked
            ? 'border-[#5B5FC7]/10 opacity-70 cursor-not-allowed'
            : 'border-[#5B5FC7]/20 hover:border-[#3CDBC0]/50 cursor-pointer'
        } rounded-xl p-2.5 text-left transition-all duration-300 backdrop-blur-sm select-none relative group z-10`}
      >
        <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1 border-b border-[#5B5FC7]/10 pb-1">
          <span className="font-semibold text-[#5B5FC7]">Partido {match.fecha}</span>
          <span>{isLocked ? '🔒 Cerrado' : getMatchDate(match.fecha)}</span>
        </div>

        {/* Local Team */}
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base select-none">{match.resolvedLocal?.flag || '⚽'}</span>
            <span className={`text-xs font-bold truncate ${
              isWinnerLocal ? 'text-white' : hasTeams ? 'text-slate-400 font-semibold' : 'text-slate-500 font-normal italic'
            }`}>
              {match.resolvedLocal?.name || match.localTeam}
            </span>
          </div>
          <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
            isWinnerLocal ? 'text-[#3CDBC0] bg-[#3CDBC0]/10' : 'text-slate-400 bg-[#0f0f23]/40'
          }`}>
            {localScore}
          </span>
        </div>

        {/* Visitor Team */}
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base select-none">{match.resolvedVisitor?.flag || '⚽'}</span>
            <span className={`text-xs font-bold truncate ${
              isWinnerVisitor ? 'text-white' : hasTeams ? 'text-slate-400 font-semibold' : 'text-slate-500 font-normal italic'
            }`}>
              {match.resolvedVisitor?.name || match.visitorTeam}
            </span>
          </div>
          <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
            isWinnerVisitor ? 'text-[#3CDBC0] bg-[#3CDBC0]/10' : 'text-slate-400 bg-[#0f0f23]/40'
          }`}>
            {visitorScore}
          </span>
        </div>

        {viewType !== 'official' && !isLocked && (
          <div className="absolute inset-0 bg-[#3CDBC0]/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center text-[10px] text-[#3CDBC0] font-bold">
            ⚡ Editar Pronóstico
          </div>
        )}
      </div>
    );
  };

  // Render group standings tables
  const renderGroupStandings = () => {
    const groupLetters: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    // Adjust predictions based on viewType
    const adjustedMatches = matches.map(m => {
      if (viewType === 'official' && officialResults[m.id]) {
        return { ...m, prediction: officialResults[m.id] };
      }
      return m;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full py-4 max-w-6xl mx-auto">
        {groupLetters.map((g) => {
          const standings = calculateGroupStandings(adjustedMatches, g);
          return (
            <div key={g} className="bg-[#1a1a2e]/60 border border-[#5B5FC7]/15 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-extrabold text-[#3CDBC0] border-b border-[#5B5FC7]/10 pb-1.5 flex justify-between items-center">
                <span>Grupo {g}</span>
                <span className="text-[10px] text-slate-500 font-normal">Copa Mundial 2026</span>
              </h3>
              
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase border-b border-[#5B5FC7]/5 pb-1">
                    <th className="py-1.5 w-8 text-center">Pos</th>
                    <th className="py-1.5 pl-2">Equipo</th>
                    <th className="py-1.5 w-12 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, idx) => {
                    const isQualified = idx < 2; // Top 2 qualify
                    return (
                      <tr 
                        key={team.code} 
                        className={`border-b border-[#5B5FC7]/5 hover:bg-[#5B5FC7]/5 transition-colors ${
                          isQualified ? 'bg-[#3CDBC0]/5 text-white font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <td className="py-2 text-center font-mono font-bold">
                          {isQualified ? (
                            <span className="text-[#3CDBC0]">0{idx + 1}</span>
                          ) : (
                            <span>0{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-2 pl-2 flex items-center gap-2 font-semibold">
                          <span className="text-base select-none">{team.flag}</span>
                          <span className="truncate">{team.name}</span>
                        </td>
                        <td className="py-2 text-center font-mono font-extrabold">
                          {team.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* CSS to hide scrollbars but keep functionality & Grab cursor style */}
      <style>{`
        /* Hide scrollbars for Chrome, Safari and Opera */
        .custom-bracket-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbars for IE, Edge and Firefox */
        .custom-bracket-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .grab-cursor {
          cursor: grab;
        }
        .grab-cursor:active {
          cursor: grabbing;
        }
      `}</style>

      {/* Title & View Switcher */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏆 Fixture Interactivo
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Visualizá y editá tu llave final. Los ganadores avanzan automáticamente.
          </p>
        </div>

        <div className="flex bg-[#0f0f23] p-1 rounded-xl border border-[#5B5FC7]/20 w-full md:w-auto">
          <button
            onClick={() => setViewType('predicted')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewType === 'predicted'
                ? 'bg-[#3CDBC0] text-[#0f0f23] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔮 Mis Pronósticos
          </button>
          <button
            onClick={() => setViewType('official')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewType === 'official'
                ? 'bg-[#3CDBC0] text-[#0f0f23] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Resultados Oficiales
          </button>
        </div>
      </div>

      {/* Tabs for navigation */}
      <div className="flex overflow-x-auto bg-[#1a1a2e]/60 p-1.5 rounded-xl border border-[#5B5FC7]/15 gap-1 scrollbar-none">
        {[
          { id: 'full', label: 'Árbol Completo' },
          { id: 'groups', label: 'Fase de Grupos' },
          { id: 'r32', label: '16avos' },
          { id: 'r16', label: 'Octavos' },
          { id: 'qf', label: 'Cuartos' },
          { id: 'sf', label: 'Semis' },
          { id: 'final', label: 'Final' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-[#5B5FC7]/25 text-[#3CDBC0] border border-[#3CDBC0]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bracket Tree Container */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`glass rounded-3xl p-6 overflow-x-auto overflow-y-auto border border-[#5B5FC7]/10 relative flex items-center justify-start w-full custom-bracket-scrollbar pb-8 ${activeTab === 'full' ? 'grab-cursor' : ''} ${isDragging && activeTab === 'full' ? 'cursor-grabbing' : ''}`}
        style={{ minHeight: activeTab === 'full' ? '940px' : 'auto', maxHeight: activeTab === 'full' ? '940px' : 'none' }}
      >
        {/* Full Bracket Tree (Left & Right Sides converging to Center) */}
        {activeTab === 'full' ? (
          <div className="flex items-center gap-0 select-none justify-between w-[1920px] h-[880px] shrink-0 py-4">
            
            {/* ==================== LEFT SIDE BRACKET ==================== */}
            <div className="flex items-center gap-0">
              
              {/* R32 Left */}
              <div className="flex flex-col h-[880px] justify-between z-10">
                {renderMatchNode('A_M73')}
                {renderMatchNode('A_M75')}
                {renderMatchNode('A_M74')}
                {renderMatchNode('A_M77')}
                {renderMatchNode('A_M76')}
                {renderMatchNode('A_M78')}
                {renderMatchNode('A_M79')}
                {renderMatchNode('A_M80')}
              </div>

              {/* Connectors R32 -> R16 Left */}
              <div className="flex flex-col h-[880px] justify-around w-[30px] relative">
                {/* 4 Bracket lines - Mathematically Centered */}
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="absolute border-y-2 border-r-2 border-slate-600/40 w-[20px]"
                    style={{
                      top: `${6.25 + i * 25}%`,
                      height: '12.5%',
                      left: '0px',
                    }}
                  >
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[10px] h-[2px] bg-slate-600/40" />
                  </div>
                ))}
              </div>

              {/* R16 Left */}
              <div className="flex flex-col h-[880px] justify-around pl-2 z-10">
                {renderMatchNode('A_M90')}
                {renderMatchNode('A_M89')}
                {renderMatchNode('A_M91')}
                {renderMatchNode('A_M92')}
              </div>

              {/* Connectors R16 -> QF Left */}
              <div className="flex flex-col h-[880px] justify-around w-[30px] relative">
                {/* 2 Bracket lines - Mathematically Centered */}
                {[0, 1].map((i) => (
                  <div 
                    key={i} 
                    className="absolute border-y-2 border-r-2 border-slate-600/40 w-[20px]"
                    style={{
                      top: `${12.5 + i * 50}%`,
                      height: '25%',
                      left: '0px',
                    }}
                  >
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[10px] h-[2px] bg-slate-600/40" />
                  </div>
                ))}
              </div>

              {/* QF Left */}
              <div className="flex flex-col h-[880px] justify-around pl-2 z-10">
                {renderMatchNode('A_M97')}
                {renderMatchNode('A_M99')}
              </div>

              {/* Connectors QF -> SF Left */}
              <div className="flex flex-col h-[880px] justify-around w-[30px] relative">
                <div 
                  className="absolute border-y-2 border-r-2 border-slate-600/40 w-[20px]"
                  style={{
                    top: '25%',
                    height: '50%',
                    left: '0px',
                  }}
                >
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[10px] h-[2px] bg-slate-600/40" />
                </div>
              </div>

              {/* SF Left */}
              <div className="flex flex-col h-[880px] justify-center pl-2 z-10">
                {renderMatchNode('A_M101')}
              </div>

              {/* Connector SF -> Final Left */}
              <div className="w-[30px] h-[2px] bg-slate-600/40 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3CDBC0] shadow-[0_0_8px_#3CDBC0]" />
              </div>

            </div>

            {/* ==================== CENTER: FINAL & TROPHY ==================== */}
            <div className="flex flex-col items-center justify-center gap-10 px-4 min-w-[280px]">
              
              {/* World Cup Trophy Art */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 flex items-center justify-center bg-gradient-to-tr from-amber-500/20 via-yellow-400/5 to-transparent rounded-full border border-yellow-400/20 shadow-[0_0_24px_rgba(244,196,48,0.15)] animate-pulse">
                  <span className="text-6xl">🏆</span>
                </div>
                <div className="text-sm font-bold text-yellow-400 mt-3 tracking-wider uppercase font-serif">FIFA World Cup</div>
                <div className="text-[10px] text-slate-400">Canadá-EUA-México 2026</div>
              </div>

              {/* Final Node */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest flex items-center gap-1">
                  ⭐ Gran Final ⭐
                </div>
                {renderMatchNode('A_M104')}
              </div>

              {/* 3er Puesto Node */}
              <div className="flex flex-col items-center gap-1 mt-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Tercer Puesto
                </div>
                {renderMatchNode('A_M103')}
              </div>

            </div>

            {/* ==================== RIGHT SIDE BRACKET ==================== */}
            <div className="flex items-center gap-0">
              
              {/* Connector SF -> Final Right */}
              <div className="w-[30px] h-[2px] bg-slate-600/40 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3CDBC0] shadow-[0_0_8px_#3CDBC0]" />
              </div>

              {/* SF Right */}
              <div className="flex flex-col h-[880px] justify-center pr-2 z-10">
                {renderMatchNode('A_M102')}
              </div>

              {/* Connectors QF -> SF Right */}
              <div className="flex flex-col h-[880px] justify-around w-[30px] relative">
                <div 
                  className="absolute border-y-2 border-l-2 border-slate-600/40 w-[20px]"
                  style={{
                    top: '25%',
                    height: '50%',
                    right: '0px',
                  }}
                >
                  <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[10px] h-[2px] bg-slate-600/40" />
                </div>
              </div>

              {/* QF Right */}
              <div className="flex flex-col h-[880px] justify-around pr-2 z-10">
                {renderMatchNode('A_M98')}
                {renderMatchNode('A_M100')}
              </div>

              {/* Connectors R16 -> QF Right */}
              <div className="flex flex-col h-[880px] justify-around w-[30px] relative">
                {/* 2 Bracket lines - Mathematically Centered */}
                {[0, 1].map((i) => (
                  <div 
                    key={i} 
                    className="absolute border-y-2 border-l-2 border-slate-600/40 w-[20px]"
                    style={{
                      top: `${12.5 + i * 50}%`,
                      height: '25%',
                      right: '0px',
                    }}
                  >
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[10px] h-[2px] bg-slate-600/40" />
                  </div>
                ))}
              </div>

              {/* R16 Right */}
              <div className="flex flex-col h-[880px] justify-around pr-2 z-10">
                {renderMatchNode('A_M93')}
                {renderMatchNode('A_M94')}
                {renderMatchNode('A_M95')}
                {renderMatchNode('A_M96')}
              </div>

              {/* Connectors R32 -> R16 Right */}
              <div className="flex flex-col h-[880px] justify-around w-[30px] relative">
                {/* 4 Bracket lines - Mathematically Centered */}
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="absolute border-y-2 border-l-2 border-slate-600/40 w-[20px]"
                    style={{
                      top: `${6.25 + i * 25}%`,
                      height: '12.5%',
                      right: '0px',
                    }}
                  >
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[10px] h-[2px] bg-slate-600/40" />
                  </div>
                ))}
              </div>

              {/* R32 Right */}
              <div className="flex flex-col h-[880px] justify-between z-10">
                {renderMatchNode('A_M83')}
                {renderMatchNode('A_M84')}
                {renderMatchNode('A_M81')}
                {renderMatchNode('A_M82')}
                {renderMatchNode('A_M86')}
                {renderMatchNode('A_M88')}
                {renderMatchNode('A_M85')}
                {renderMatchNode('A_M87')}
              </div>

            </div>

          </div>
        ) : null}

        {/* Render Group Standings inside this container when activeTab is groups */}
        {activeTab === 'groups' && renderGroupStandings()}

        {/* Tabbed Views for mobile layouts */}
        {activeTab === 'r32' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 w-full max-w-2xl mx-auto">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider">Lado Izquierdo</h4>
              {renderMatchNode('A_M73')}
              {renderMatchNode('A_M75')}
              {renderMatchNode('A_M74')}
              {renderMatchNode('A_M77')}
              {renderMatchNode('A_M76')}
              {renderMatchNode('A_M78')}
              {renderMatchNode('A_M79')}
              {renderMatchNode('A_M80')}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider">Lado Derecho</h4>
              {renderMatchNode('A_M83')}
              {renderMatchNode('A_M84')}
              {renderMatchNode('A_M81')}
              {renderMatchNode('A_M82')}
              {renderMatchNode('A_M86')}
              {renderMatchNode('A_M88')}
              {renderMatchNode('A_M85')}
              {renderMatchNode('A_M87')}
            </div>
          </div>
        )}

        {activeTab === 'r16' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 w-full max-w-xl mx-auto">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider">Lado Izquierdo</h4>
              {renderMatchNode('A_M90')}
              {renderMatchNode('A_M89')}
              {renderMatchNode('A_M91')}
              {renderMatchNode('A_M92')}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider">Lado Derecho</h4>
              {renderMatchNode('A_M93')}
              {renderMatchNode('A_M94')}
              {renderMatchNode('A_M95')}
              {renderMatchNode('A_M96')}
            </div>
          </div>
        )}

        {activeTab === 'qf' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 w-full max-w-lg mx-auto">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider">Lado Izquierdo</h4>
              {renderMatchNode('A_M97')}
              {renderMatchNode('A_M99')}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3CDBC0] uppercase tracking-wider">Lado Derecho</h4>
              {renderMatchNode('A_M98')}
              {renderMatchNode('A_M100')}
            </div>
          </div>
        )}

        {activeTab === 'sf' && (
          <div className="flex flex-col gap-6 items-center py-4 w-full max-w-xs mx-auto">
            {renderMatchNode('A_M101')}
            {renderMatchNode('A_M102')}
          </div>
        )}

        {activeTab === 'final' && (
          <div className="flex flex-col gap-8 items-center py-6 text-center w-full max-w-xs mx-auto">
            <div className="text-sm font-bold text-yellow-400 tracking-widest uppercase">Gran Final & Tercer Puesto</div>
            {renderMatchNode('A_M104')}
            {renderMatchNode('A_M103')}
          </div>
        )}
      </div>

      {/* Editing Prediction Modal Overlay */}
      {editingMatchId && (
        <div className="fixed inset-0 bg-[#0f0f23]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#1a1a2e] border border-[#5B5FC7]/20 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">🔮 Editar Pronóstico</h3>
              <p className="text-xs text-slate-400 mt-1">
                Jornada {matchMap[editingMatchId]?.fecha} • {getMatchDate(matchMap[editingMatchId]?.fecha || 0)}
              </p>
            </div>

            {/* Score inputs */}
            <div className="flex justify-between items-center gap-6 px-4">
              {/* Local Team */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-4xl">{matchMap[editingMatchId]?.resolvedLocal?.flag || '⚽'}</span>
                <span className="text-xs font-bold text-slate-300 text-center truncate w-full">
                  {matchMap[editingMatchId]?.resolvedLocal?.name || matchMap[editingMatchId]?.localTeam}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => setLocalScoreInput(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-[#5B5FC7]/25 text-[#3CDBC0] border border-[#3CDBC0]/20 flex items-center justify-center font-bold hover:bg-[#5B5FC7]/40"
                  >
                    -
                  </button>
                  <span className="text-2xl font-mono font-extrabold text-white w-8 text-center">{localScoreInput}</span>
                  <button 
                    onClick={() => setLocalScoreInput(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-[#5B5FC7]/25 text-[#3CDBC0] border border-[#3CDBC0]/20 flex items-center justify-center font-bold hover:bg-[#5B5FC7]/40"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-xl font-bold text-[#5B5FC7]">VS</span>

              {/* Visitor Team */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-4xl">{matchMap[editingMatchId]?.resolvedVisitor?.flag || '⚽'}</span>
                <span className="text-xs font-bold text-slate-300 text-center truncate w-full">
                  {matchMap[editingMatchId]?.resolvedVisitor?.name || matchMap[editingMatchId]?.visitorTeam}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => setVisitorScoreInput(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-[#5B5FC7]/25 text-[#3CDBC0] border border-[#3CDBC0]/20 flex items-center justify-center font-bold hover:bg-[#5B5FC7]/40"
                  >
                    -
                  </button>
                  <span className="text-2xl font-mono font-extrabold text-white w-8 text-center">{visitorScoreInput}</span>
                  <button 
                    onClick={() => setVisitorScoreInput(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-[#5B5FC7]/25 text-[#3CDBC0] border border-[#3CDBC0]/20 flex items-center justify-center font-bold hover:bg-[#5B5FC7]/40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Tie-breaker Alert */}
            <div className="bg-[#5B5FC7]/10 border border-[#5B5FC7]/20 rounded-2xl p-3 flex gap-2 text-[11px] text-slate-400">
              <HelpCircle className="w-4 h-4 text-[#3CDBC0] shrink-0" />
              <span>
                En caso de empate, avanzará el equipo local de manera predeterminada para calcular la progresión del Fixture.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setEditingMatchId(null)}
                className="flex-1 py-3 text-sm font-semibold rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={savePrediction}
                className="flex-1 py-3 text-sm font-bold rounded-2xl bg-[#3CDBC0] text-[#0f0f23] hover:bg-[#3CDBC0]/95 hover:shadow-lg transition-all"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
