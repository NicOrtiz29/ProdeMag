import React from 'react';
import { Match, BotStatItem } from '../types';
import { Target, Trophy, BarChart3, User } from 'lucide-react';

interface DashboardViewProps {
  matches: Match[];
  stats: BotStatItem[];
  onNavigateToTab: (tabId: string) => void;
}

export default function DashboardView({ matches, stats, onNavigateToTab }: DashboardViewProps) {
  const totalMatches = matches.length;
  const matchesWithPrediction = matches.filter(m => m.prediction[0] > 0 || m.prediction[1] > 0).length;
  
  const quickActions = [
    { 
      icon: <Target className="w-6 h-6 text-[#3CDBC0]" />,
      title: 'Mis Pronósticos',
      description: 'Cargá tus resultados para cada partido',
      tab: 'pronosticos',
    },
    {
      icon: <Trophy className="w-6 h-6 text-[#F4C430]" />,
      title: 'Tabla de Posiciones',
      description: 'Mirá quién va ganando en tu empresa',
      tab: 'tabla',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-[#75AADB]" />,
      title: 'Historial',
      description: 'Resultados y estadísticas pasadas',
      tab: 'historico',
    },
    {
      icon: <User className="w-6 h-6 text-[#5B5FC7]" />,
      title: 'Mi Perfil',
      description: 'Editá tu nombre, avatar y provincia',
      tab: 'perfil',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Hero Banner with celebration image & Magnetico Branding */}
      <div className="rounded-3xl overflow-hidden relative shadow-2xl shadow-[#5B5FC7]/20 border border-[#5B5FC7]/50 min-h-[280px] sm:min-h-[320px] flex items-center">
        {/* Magnetico purple base */}
        <div className="absolute inset-0 bg-[#5B5FC7]"></div>
        
        {/* Blended Argentina image */}
        <img 
          src="/argentina-campeon-2026.png" 
          alt="Argentina Campeón 2026" 
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
        />
        
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-[#0f0f23]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B5FC7]/80 to-transparent" />

        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 py-10">
          <div className="flex gap-1 mb-4">
            <span className="text-xl drop-shadow-md">⭐</span>
            <span className="text-3xl -mt-2 drop-shadow-md text-[#F4C430]">⭐</span>
            <span className="text-xl drop-shadow-md">⭐</span>
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-white">{totalMatches}</span>
          <span className="block text-xs text-slate-400 mt-1">Partidos</span>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-[#3CDBC0]">{matchesWithPrediction}</span>
          <span className="block text-xs text-slate-400 mt-1">Cargados</span>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-[#F4C430]">3</span>
          <span className="block text-xs text-slate-400 mt-1">Pts x Exacto</span>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <span className="text-2xl font-extrabold text-[#75AADB]">1</span>
          <span className="block text-xs text-slate-400 mt-1">Pt x Ganador</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.tab}
            onClick={() => onNavigateToTab(action.tab)}
            className="glass rounded-2xl p-5 text-left flex items-center gap-4 group hover:border-[#5B5FC7]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[#5B5FC7]/10 border border-[#5B5FC7]/15 flex items-center justify-center shrink-0">
              {action.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white group-hover:text-[#3CDBC0] transition-colors">{action.title}</h3>
              <p className="text-sm text-slate-400">{action.description}</p>
            </div>
            <span className="ml-auto text-slate-600 group-hover:text-[#3CDBC0] transition-colors text-lg">→</span>
          </button>
        ))}
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">¿Cómo funciona?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#3CDBC0]/10 border border-[#3CDBC0]/20 flex items-center justify-center mx-auto text-lg font-bold text-[#3CDBC0]">1</div>
            <h4 className="font-semibold text-white text-sm">Cargá tu pronóstico</h4>
            <p className="text-xs text-slate-400">Usá los botones + y − para poner el resultado que pensás.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#75AADB]/10 border border-[#75AADB]/20 flex items-center justify-center mx-auto text-lg font-bold text-[#75AADB]">2</div>
            <h4 className="font-semibold text-white text-sm">Esperá el resultado</h4>
            <p className="text-xs text-slate-400">El admin carga los resultados oficiales después de cada partido.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F4C430]/10 border border-[#F4C430]/20 flex items-center justify-center mx-auto text-lg font-bold text-[#F4C430]">3</div>
            <h4 className="font-semibold text-white text-sm">Sumá puntos</h4>
            <p className="text-xs text-slate-400">3 pts por resultado exacto, 1 pt por acertar ganador o empate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
