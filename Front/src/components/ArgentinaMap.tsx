/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StandingsEntry } from '../types';
import { ARGENTINA_PATHS, ProvincePath } from './argentina_paths';
import { Users, Award, MapPin } from 'lucide-react';

interface ArgentinaMapProps {
  standings: StandingsEntry[];
}

export default function ArgentinaMap({ standings }: ArgentinaMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Normalizer for robust mapping
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const getAssignedProvince = (player: StandingsEntry): string => {
    if (player.province && player.province.trim() !== '') return player.province;
    // Fallbacks for default/mock users
    const nameNorm = player.name.toLowerCase();
    if (nameNorm.includes('santi')) return 'Buenos Aires';
    if (nameNorm.includes('flor')) return 'Córdoba';
    if (nameNorm.includes('mati')) return 'Santa Fe';
    if (nameNorm.includes('male')) return 'Mendoza';
    if (nameNorm.includes('nico')) return 'Tucumán';
    return 'Ciudad de Buenos Aires';
  };

  // International regions (separate from Argentina paths)
  const internationalRegions = ['Madrid', 'Venezuela'];

  // Define all regions shown on the map (Argentina provinces only for the SVG)
  const allMapRegions = useMemo<ProvincePath[]>(() => {
    return ARGENTINA_PATHS;
  }, []);

  // All named regions (Argentina + international) for stats grouping
  const allRegions = useMemo(() => {
    const intl = internationalRegions.map(name => ({ name }));
    return [...ARGENTINA_PATHS, ...intl];
  }, []);

  // Group standings by province
  const provinceStats = useMemo(() => {
    const stats: Record<string, { players: StandingsEntry[]; maxScore: number }> = {};

    allRegions.forEach(p => {
      stats[p.name] = { players: [], maxScore: 0 };
    });

    standings.forEach((p) => {
      const dbProvince = getAssignedProvince(p);
      const dbProvinceNorm = normalize(dbProvince);

      // Find matched province/region
      const matched = allRegions.find(path => {
        const svgNorm = normalize(path.name);
        if (svgNorm === dbProvinceNorm) return true;
        if (svgNorm === 'ciudad de buenos aires' && (dbProvinceNorm === 'caba' || dbProvinceNorm === 'ciudad autonoma de buenos aires')) return true;
        return false;
      });

      if (matched) {
        stats[matched.name].players.push(p);
        if (p.points > stats[matched.name].maxScore) {
          stats[matched.name].maxScore = p.points;
        }
      }
    });

    // Sort players in each province by points descending
    Object.keys(stats).forEach(k => {
      stats[k].players.sort((a, b) => b.points - a.points);
    });

    return stats;
  }, [standings, allRegions]);

  // Determine tiers dynamically based on actual province max scores
  const scoreTiers = useMemo(() => {
    const allScores = Object.values(provinceStats)
      .map((s: any) => s.maxScore)
      .filter(score => score > 0);

    if (allScores.length === 0) return { leaderScore: 0, midScore: 0 };

    const uniqueScores = Array.from(new Set(allScores)).sort((a, b) => b - a);
    
    // Emerald: 1st place scores
    const leaderScore = uniqueScores[0] || 0;
    // Amber: 2nd or middle ranks
    const midScore = uniqueScores[1] || 0;

    return {
      leaderScore,
      midScore
    };
  }, [provinceStats]);

  const getProvinceColor = (provName: string) => {
    const stats = provinceStats[provName];
    if (!stats || stats.players.length === 0) {
      return {
        fill: 'rgba(30, 30, 50, 0.25)',
        stroke: 'rgba(91, 95, 199, 0.15)',
        class: 'hover:fill-[#5B5FC7]/20 transition-all duration-300',
        dotColor: 'bg-slate-700'
      };
    }

    const { leaderScore, midScore } = scoreTiers;
    const maxScore = stats.maxScore;

    if (maxScore >= leaderScore) {
      // Emerald: Leaders
      return {
        fill: 'rgba(16, 185, 129, 0.25)',
        stroke: '#10b981',
        class: 'hover:fill-emerald-500/45 cursor-pointer transition-all duration-300',
        dotColor: 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
      };
    } else if (maxScore >= midScore && midScore > 0) {
      // Amber: Siguientes
      return {
        fill: 'rgba(245, 158, 11, 0.25)',
        stroke: '#f59e0b',
        class: 'hover:fill-amber-500/45 cursor-pointer transition-all duration-300',
        dotColor: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
      };
    } else {
      // Red: Últimos
      return {
        fill: 'rgba(239, 68, 68, 0.25)',
        stroke: '#ef4444',
        class: 'hover:fill-red-500/45 cursor-pointer transition-all duration-300',
        dotColor: 'bg-red-400 shadow-[0_0_8px_#ef4444]'
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  const renderAvatar = (avatar: string | undefined, size: string = 'w-5 h-5 text-sm') => {
    if (avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.length > 8)) {
      return <img src={avatar} className={`${size} rounded-full object-cover select-none shrink-0`} alt="Avatar" />;
    }
    return <span className={`${size} flex items-center justify-center select-none shrink-0`}>{avatar || '⚽'}</span>;
  };

  // Get active provinces sorted by number of players
  const activeProvinces = useMemo(() => {
    return Object.keys(provinceStats)
      .map(name => ({
        name,
        players: provinceStats[name].players,
        count: provinceStats[name].players.length,
        maxScore: provinceStats[name].maxScore
      }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count || b.maxScore - a.maxScore);
  }, [provinceStats]);

  const hoveredStats = hoveredProvince ? provinceStats[hoveredProvince] : null;

  return (
    <div className="glass rounded-3xl p-6 border border-[#5B5FC7]/10 flex flex-col md:flex-row gap-6 items-stretch min-h-[500px]">
      
      {/* Map visualization area with SVG rendering */}
      <div 
        className="flex-1 flex flex-col items-center relative bg-[#0c0c1d]/60 rounded-2xl border border-[#5B5FC7]/15 overflow-hidden p-4 min-h-[440px]"
        onMouseMove={handleMouseMove}
      >
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e38_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Dynamic Legend */}
        <div className="absolute bottom-3 left-3 bg-[#111124]/90 border border-[#5B5FC7]/10 rounded-xl p-2.5 space-y-1.5 text-[10px] z-20 pointer-events-none">
          <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Puntaje Máximo local</div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span>Punteros ({scoreTiers.leaderScore} pts)</span>
          </div>
          {scoreTiers.midScore > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
              <span>Siguientes ({scoreTiers.midScore} pts)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <span>Últimos</span>
          </div>
        </div>

        {/* SVG Map of Argentina only */}
        <div className="w-full max-w-[320px] flex-1 relative">
          <svg
            viewBox="185 0 480 1752"
            className="w-full h-full object-contain"
            xmlns="http://www.w3.org/2000/svg"
          >
            {allMapRegions.map((p) => {
              const style = getProvinceColor(p.name);
              const isHovered = hoveredProvince === p.name;
              
              return (
                <g 
                  key={p.name}
                  onMouseEnter={() => setHoveredProvince(p.name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  className="group"
                >
                  {p.paths.map((d, index) => (
                    <path
                      key={index}
                      d={d}
                      fill={isHovered ? 'rgba(60, 219, 192, 0.35)' : style.fill}
                      stroke={isHovered ? '#3CDBC0' : style.stroke}
                      strokeWidth={isHovered ? 7.5 : 3.0}
                      className={`${style.class} transition-all duration-300`}
                      style={{
                        filter: isHovered ? 'drop-shadow(0 0 10px rgba(60,219,192,0.65))' : 'none'
                      }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredProvince && hoveredStats && hoveredStats.players.length > 0 && (
            <div 
              className="absolute pointer-events-none bg-[#111124]/95 border border-[#3CDBC0]/40 rounded-xl p-3 shadow-2xl z-50 min-w-[180px] text-left transition-all duration-75"
              style={{
                left: `${Math.min(tooltipPos.x, 150)}px`,
                top: `${Math.min(tooltipPos.y, 340)}px`
              }}
            >
              <h4 className="font-extrabold text-white text-xs border-b border-[#5B5FC7]/10 pb-1.5 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#3CDBC0]" /> {hoveredProvince}
              </h4>
              <div className="space-y-1.5">
                {hoveredStats.players.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {renderAvatar(p.avatar, 'w-4 h-4 text-[10px]')}
                      <span className="text-[10px] text-slate-300 truncate max-w-[90px]">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white font-mono">{p.points} pts</span>
                  </div>
                ))}
                {hoveredStats.players.length > 3 && (
                  <div className="text-[9px] text-[#3CDBC0] font-semibold text-center pt-1 border-t border-[#5B5FC7]/5">
                    + {hoveredStats.players.length - 3} jugadores más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* International Regions — separate row BELOW the Argentina map */}
        <div className="flex gap-3 justify-center pb-3 pt-1 w-full">
          {internationalRegions.map(regionName => {
            const style = getProvinceColor(regionName);
            const isHovered = hoveredProvince === regionName;
            const regionStats = provinceStats[regionName];
            const flag = regionName === 'Madrid' ? '🇪🇸' : '🇻🇪';
            return (
              <button
                key={regionName}
                onMouseEnter={() => setHoveredProvince(regionName)}
                onMouseLeave={() => setHoveredProvince(null)}
                className="flex-1 max-w-[140px] rounded-xl px-3 py-2.5 border text-left transition-all duration-300 cursor-pointer"
                style={{
                  background: isHovered ? 'rgba(60, 219, 192, 0.18)' : 'rgba(30,30,50,0.5)',
                  borderColor: isHovered ? '#3CDBC0' : 'rgba(91,95,199,0.25)',
                  boxShadow: isHovered ? '0 0 14px rgba(60,219,192,0.35)' : 'none'
                }}
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-base">{flag}</span>
                  <span>{regionName}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {regionStats?.players.length ?? 0} jugador{(regionStats?.players.length ?? 0) !== 1 ? 'es' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info panel sidebar */}
      <div className="w-full md:w-[260px] flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            📍 Competencia Provincial
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Explorá el mapa geográfico interactivo de Argentina para ver los pronósticos y rendimientos de los participantes en cada provincia.
          </p>
        </div>

        {/* Selected Province Details Card */}
        <div className="bg-[#1a1a2e]/60 border border-[#5B5FC7]/15 rounded-2xl p-4 flex-1 flex flex-col justify-center min-h-[220px]">
          {hoveredProvince ? (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div className="border-b border-[#5B5FC7]/10 pb-2">
                <span className="text-[10px] uppercase font-bold text-[#3CDBC0] tracking-wider block">Provincia Seleccionada</span>
                <h4 className="font-extrabold text-white text-base">
                  {hoveredProvince}
                </h4>
              </div>

              {hoveredStats && hoveredStats.players.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-[200px] flex-1 pr-1 mt-2">
                  {hoveredStats.players.map((p, idx) => (
                    <div 
                      key={p.id} 
                      className={`flex justify-between items-center bg-[#0f0f23]/40 rounded-xl p-2 border ${
                        idx === 0 ? 'border-emerald-500/20' : 'border-[#5B5FC7]/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-500 w-4">{idx + 1}º</span>
                        {renderAvatar(p.avatar, 'w-5 h-5 text-xs')}
                        <span className="text-xs font-semibold text-slate-200 truncate w-[100px]">{p.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-white font-mono">{p.points} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 italic flex-1 flex flex-col justify-center">
                  Sin participantes registrados en esta provincia.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div className="border-b border-[#5B5FC7]/10 pb-2">
                <span className="text-[10px] uppercase font-bold text-[#3CDBC0] tracking-wider block">Distribución General</span>
                <h4 className="font-extrabold text-white text-sm">
                  Jugadores por Provincia
                </h4>
              </div>
              
              {activeProvinces.length > 0 ? (
                <div className="space-y-2.5 overflow-y-auto max-h-[220px] flex-1 pr-1 mt-2 scrollbar-none">
                  {activeProvinces.map((ap) => {
                    const maxPlayersCount = Math.max(...activeProvinces.map(p => p.count), 1);
                    const barWidth = `${(ap.count / maxPlayersCount) * 100}%`;
                    const leader = ap.players[0];
                    
                    return (
                      <div key={ap.name} className="space-y-1 bg-[#0f0f23]/40 rounded-xl p-2.5 border border-[#5B5FC7]/5">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                          <span className="truncate max-w-[120px]">{ap.name}</span>
                          <span className="text-[#3CDBC0] text-[9px] font-mono bg-[#3CDBC0]/10 px-2 py-0.5 rounded flex items-center gap-1 border border-[#3CDBC0]/20">
                            👥 {ap.count} {ap.count === 1 ? 'jugador' : 'jugadores'}
                          </span>
                        </div>
                        {/* Custom bar chart representation */}
                        <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-[#5B5FC7] to-[#3CDBC0] h-full rounded-full" style={{ width: barWidth }} />
                        </div>
                        {leader && (
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span className="truncate max-w-[130px]">👑 {leader.name}</span>
                            <span className="font-bold text-white font-mono">{leader.points} pts</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 italic flex-1 flex flex-col justify-center">
                  No hay jugadores asignados a provincias todavía.
                </div>
              )}
              
              <div className="text-[9px] text-slate-500 text-center leading-tight mt-1 border-t border-[#5B5FC7]/5 pt-2">
                Desplazá el mouse sobre el mapa para ver los detalles locales.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
