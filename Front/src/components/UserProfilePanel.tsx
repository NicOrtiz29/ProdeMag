/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match } from '../types';
import { User, Award, ShieldAlert, Sparkles, UserCheck, Check, Save, Target, MapPin } from 'lucide-react';
import { calculateMatchPoints } from '../utils/points';

const PROVINCES_POOL = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

import { StandingsEntry } from '../types';

interface UserProfilePanelProps {
  matches: Match[];
  standings?: StandingsEntry[];
}

const AVATARS_POOL = ['🚀', '⚽', '🎨', '💻', '🧠', '👑', '📈', '🧤', '🔥', '🏆', '🧙‍♂️', '⚡'];
const ROLES_POOL = [
  'Tech Lead',
  'Analista Funcional',
  'Senior Frontend Dev',
  'Backend Engineer',
  'QA Automation Lead',
  'Product Owner',
  'UX/UI Designer',
  'SysOps Administrador',
  'Recursos Humanos'
];

export default function UserProfilePanel({ matches, standings = [] }: UserProfilePanelProps) {
  const { user, updateUser } = useAuth();

  // Merge real standings with simulated ones to match what is displayed in DetailedStandings!
  const mergedStandings = useMemo(() => {
    const SIMULATED_PLAYERS: StandingsEntry[] = [
      { id: 'sim-1', name: 'Lucas Martínez', points: 18, isBot: false, avatar: '🧑‍💻', role: 'Desarrollo', province: 'Buenos Aires' },
      { id: 'sim-2', name: 'Valentina Ruiz', points: 15, isBot: false, avatar: '👩‍🎨', role: 'Diseño', province: 'Córdoba' },
      { id: 'sim-3', name: 'Mateo García', points: 14, isBot: false, avatar: '🧔', role: 'Data', province: 'Mendoza' },
      { id: 'sim-4', name: 'Camila López', points: 12, isBot: false, avatar: '👩‍💼', role: 'Marketing', province: 'Santa Fe' },
      { id: 'sim-5', name: 'Tomás Fernández', points: 11, isBot: false, avatar: '🧑‍🔬', role: 'QA', province: 'Tucumán' },
      { id: 'sim-6', name: 'Sofía Romero', points: 9, isBot: false, avatar: '👩‍🚀', role: 'Producto', province: 'Neuquén' },
      { id: 'sim-7', name: 'Joaquín Díaz', points: 7, isBot: false, avatar: '🧑‍🏫', role: 'Soporte', province: 'Salta' },
      { id: 'sim-8', name: 'Martina Gómez', points: 5, isBot: false, avatar: '👩‍⚕️', role: 'RRHH', province: 'Entre Ríos' },
    ];
    const realIds = new Set(standings.map(s => s.id));
    const simulatedToAdd = SIMULATED_PLAYERS.filter(s => !realIds.has(s.id));
    return [...standings, ...simulatedToAdd].sort((a, b) => b.points - a.points);
  }, [standings]);

  const rankingInfo = useMemo(() => {
    if (!user) return { positionText: 'Sin posición', rivalName: 'Ninguno', rivalRole: '' };
    const myIndex = mergedStandings.findIndex(s => s.id === user.id);
    if (myIndex === -1) {
      return {
        positionText: 'Sin posición',
        rivalName: 'Ninguno',
        rivalRole: ''
      };
    }

    // Determine position text with emojis
    const rank = myIndex + 1;
    let positionText = `${rank}º Puesto`;
    if (rank === 1) positionText = '1º Puesto (Puntero) 🥇';
    else if (rank === 2) positionText = '2º Puesto 🥈';
    else if (rank === 3) positionText = '3º Puesto 🥉';

    // Determine rival (if 1st place, rival is 2nd. Otherwise, rival is the one immediately above them)
    const rivalIndex = myIndex === 0 ? 1 : myIndex - 1;
    const rival = mergedStandings[rivalIndex];
    const rivalName = rival ? rival.name : 'Ninguno';
    const rivalRole = rival && rival.role ? ` (${rival.role})` : '';

    return {
      positionText,
      rivalName,
      rivalRole
    };
  }, [mergedStandings, user?.id]);

  const [editName, setEditName] = useState<string>(user?.name || '');
  const [editRole, setEditRole] = useState<string>(user?.role || '');
  const [editAvatar, setEditAvatar] = useState<string>(user?.avatar || '🚀');
  const [editBio, setEditBio] = useState<string>(user?.bio || '');
  const [editProvince, setEditProvince] = useState<string>(user?.province || '');

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Dynamic statistics calculations from user's predictions (database matches)
  const userStats = useMemo(() => {
    let points = 0;
    let acertados = 0;
    let resolvedMatches = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    // Sort matches chronologically for a correct streak calculation
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha - b.fecha;
      return a.hora.localeCompare(b.hora);
    });

    sortedMatches.forEach(m => {
      if (m.realResult) {
        resolvedMatches += 1;
        const pts = calculateMatchPoints(m.prediction, m.realResult);
        points += pts;
        if (pts > 0) {
          acertados += 1;
          currentStreak += 1;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
        } else {
          currentStreak = 0;
        }
      }
    });

    const accuracy = resolvedMatches > 0 ? Math.round((acertados / resolvedMatches) * 100) : 0;

    return {
      points,
      accuracy,
      streak: maxStreak,
      resolvedMatches
    };
  }, [matches]);

  if (!user) {
    return (
      <div className="bg-slate-900/40 p-12 text-center rounded-2xl border border-slate-800 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
        <p className="text-sm font-semibold text-white">No has iniciado sesión correctamente.</p>
      </div>
    );
  }

  const totalMatchesCount = matches.length;
  const nonZeroPredictions = matches.filter(m => m.prediction[0] !== 0 || m.prediction[1] !== 0).length;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    if (!editName.trim()) return;

    updateUser({
      name: editName.trim(),
      role: editRole,
      avatar: editAvatar,
      bio: editBio.trim(),
      province: editProvince,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left side: Interactive Edit Form (lg:col-span-8) */}
      <div className="lg:col-span-8 bg-[#0b111a]/85 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Absolute top decorative corner highlight */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Header header row - REMOVED the Logout button from here */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-850 gap-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display font-black text-base text-white">Editar mi Perfil del Prode</h2>
              <p className="text-3xs text-slate-400 font-mono uppercase tracking-tight">Personaliza tus credenciales y estado folclórico en vivo</p>
            </div>
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleProfileSave} className="space-y-5">
          
          {/* Dynamic saving notification */}
          {saveSuccess && (
            <div className="bg-emerald-950/20 border border-emerald-500/25 p-3.5 rounded-xl flex items-center gap-2 text-emerald-300 text-2xs font-mono animate-fade-in shadow-inner">
              <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>¡Perfil guardado correctamente! Tus datos fueron actualizados en los leaderboards del sistema.</span>
            </div>
          )}

          {/* User Details split row - Top-aligned labels with matching height */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block h-8">
                Nombre de Usuario o Nickname
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Por favor introduce un nombre descriptivo..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-white focus:outline-none transition-all font-sans font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block h-8">
                Puesto Laboral / Rol Corporativo
              </label>
              <select
                value={editRole || 'Senior Frontend Dev'}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-slate-200 focus:outline-none transition-all font-sans cursor-pointer"
              >
                {ROLES_POOL.map((r) => (
                  <option key={r} value={r} className="bg-slate-950 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block h-8">
                Provincia
              </label>
              <select
                value={editProvince || ''}
                onChange={(e) => setEditProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-slate-200 focus:outline-none transition-all font-sans cursor-pointer"
              >
                <option value="" className="bg-slate-950 text-slate-500">Seleccionar provincia...</option>
                {PROVINCES_POOL.map((p) => (
                  <option key={p} value={p} className="bg-slate-950 text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Avatar selector slider box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                Cambiar tu Avatar de Líderes
              </label>
              <span className="text-[8px] uppercase font-mono tracking-wider text-sky-400 font-bold">¡O canchereá con foto propia!</span>
            </div>
            <div className="flex flex-wrap gap-2.5 bg-slate-950/40 border border-slate-850 p-3 rounded-2xl shadow-inner">
              {AVATARS_POOL.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setEditAvatar(av)}
                  className={`w-9.5 h-9.5 flex items-center justify-center text-xl rounded-xl hover:bg-slate-900 transition-all cursor-pointer ${
                    editAvatar === av 
                      ? 'bg-cyan-500/15 border border-cyan-500/40 scale-110 shadow-md' 
                      : 'border border-transparent'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            {/* PC File Upload integration for custom avatar */}
            <div className="mt-2">
              <label className="relative overflow-hidden flex items-center justify-center gap-2 border-2 border-dashed border-sky-400/40 hover:border-sky-300 bg-sky-950/20 hover:bg-sky-900/35 px-4 py-3.5 rounded-xl text-3xs font-black uppercase text-sky-300 font-mono tracking-widest cursor-pointer transition-all active:scale-[0.98] select-none text-center">
                <span>📁 SUBIR NUEVO AVATAR DESDE LA PC 🇦🇷</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Security (#8): Limit avatar file size to 512KB
                      const MAX_SIZE = 512 * 1024; // 512KB
                      if (file.size > MAX_SIZE) {
                        alert('La imagen es muy grande. Máximo 500KB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) {
                          setEditAvatar(reader.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Status Bio Text */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
              Tu Estado Narrativo (Bio folclórica de cancha)
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Ej. 'No compilo con bugs pero juego el prode a matar o morir... ¡Cuidado con el bache predictivo!'"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-white focus:outline-none transition-all leading-relaxed font-sans resize-none"
            />
          </div>

          {/* Locked fields display info */}
          <div className="bg-[#070c14] border border-slate-900 rounded-xl p-3.5 space-y-1 text-3xs font-mono text-slate-500 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-slate-400">
              🔒 DATOS DE CUENTA INALTERABLES
            </div>
            <div>
              <span className="text-slate-400 font-bold">Correo electrónico registrado: </span>
              <span className="text-slate-350">{user.email}</span>
            </div>
            <p>La dirección de mail asociada a tu cuenta local provee la clave primaria exclusiva en nuestra base de datos simulada y no puede ser modificada.</p>
          </div>

          {/* Submit Save profile */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 font-display text-xs font-black text-white rounded-xl shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios de Perfil
          </button>

        </form>

      </div>

      {/* Right side: User card visual status & dynamic simulator info (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* High-fidelity leaderboards styled preview card container */}
        <div className="bg-[#0b111a]/85 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl text-center">
          
          {/* Centered title of the Leader Card */}
          <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest text-center">
            Tarjeta de Líder
          </h3>

          {/* Big graphical Avatar & Details view */}
          <div className="space-y-2 py-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#0f172a] to-cyan-950/40 border border-slate-850 rounded-2xl flex items-center justify-center text-4xl select-none mx-auto shadow-xl ring-2 ring-cyan-500/15 animate-pulse overflow-hidden">
              {editAvatar && (editAvatar.startsWith('data:image/') || editAvatar.startsWith('http') || editAvatar.length > 8) ? (
                <img src={editAvatar} className="w-full h-full object-cover" alt="Custom Avatar" />
              ) : (
                editAvatar
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="font-display font-black text-white text-base truncate">
                {editName || 'Tu Nickname'}
              </h4>
              <p className="text-3xs text-cyan-400 font-mono font-bold tracking-tight uppercase">
                {editRole}
              </p>
              {editProvince && (
                <p className="text-3xs text-slate-400 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {editProvince}
                </p>
              )}
            </div>
          </div>

          {/* Visual statistics dashboard boxes - Populated dynamically from actual database prediction accuracy */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 text-center text-3xs font-mono">
            <div className="py-1">
              <span className="text-[8px] text-slate-500 uppercase block">Puntos</span>
              <span className="font-display text-base font-black text-slate-100">{userStats.points}</span>
            </div>
            <div className="border-x border-slate-900 py-1">
              <span className="text-[8px] text-slate-500 uppercase block">Aciertos</span>
              <span className="font-display text-base font-black text-emerald-400">{userStats.accuracy}%</span>
            </div>
            <div className="py-1">
              <span className="text-[8px] text-slate-500 uppercase block">Racha</span>
              <span className="font-display text-base font-black text-amber-500">+{userStats.streak} 🔥</span>
            </div>
          </div>

          {/* Quick bio quote block */}
          <div className="bg-[#0c1320]/60 p-3 rounded-lg border border-[#162235]/30 text-3xs italic text-slate-350 min-h-[50px] flex items-center justify-center leading-relaxed">
            "{editBio || 'Sin estado folclórico definido. ¡Agrégale un toque gracioso en el formulario!'}"
          </div>

        </div>

        {/* Dynamic game counts info card */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <h4 className="font-display font-medium text-xs text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Target className="w-4 h-4 text-cyan-400" /> Rendimiento de tu Prode
          </h4>

          <div className="space-y-2 font-mono text-[10px] leading-relaxed text-slate-350">
            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span className="text-slate-450">Partidos con Goles editados:</span>
              <strong className="text-white">{nonZeroPredictions} / {totalMatchesCount}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-850 pb-1.5">
              <span className="text-slate-450">Rival competitivo directo:</span>
              <strong className="text-amber-500">{rankingInfo.rivalName}{rankingInfo.rivalRole}</strong>
            </div>

            <div className="flex justify-between pb-1">
              <span className="text-slate-450">Posición estimada:</span>
              <strong className="text-cyan-400">{rankingInfo.positionText}</strong>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-3 text-3xs text-slate-500 leading-relaxed text-center font-sans">
            A medida que realizas cambios en el Tab de <strong className="text-slate-400 font-medium">"Pronósticos"</strong> el simulador acumula dinámicamente tu asertividad.
          </div>
        </div>

      </div>

    </div>
  );
}
