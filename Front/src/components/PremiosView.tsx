/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Gift, Award, Save, Edit3, Image, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface Prize {
  id?: string;
  position: number;
  title: string;
  description: string;
  image_url: string;
}

const DEFAULT_PRIZES: Prize[] = [
  { position: 1, title: 'Remera de Argentina', description: 'La camiseta oficial de la selección campeona del mundo, talle a elección.', image_url: '/remera_argentina.png' },
  { position: 2, title: 'Cafetera Nespresso', description: 'Para empezar tus mañanas de desarrollo con un café premium en cápsulas.', image_url: '/cafetera_nespresso.png' },
  { position: 3, title: 'Pava eléctrica', description: 'Tu compañera ideal de acero inoxidable para cebar unos buenos mates en la oficina.', image_url: '/pava_electrica.png' },
  { position: 4, title: 'Juego de mate', description: 'Kit premium: Mate de calabaza forrado en cuero, bombilla de alpaca y termo de acero.', image_url: '/juego_mate.png' },
  { position: 5, title: 'Gin Tonic', description: 'Un kit de Gin nacional artesanal y 4 latas de tónica para festejar el podio.', image_url: '/gin_tonic.png' },
];

export default function PremiosView() {
  const { user } = useAuth();
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Local state copy for edits
  const [editedPrizes, setEditedPrizes] = useState<Prize[]>(DEFAULT_PRIZES);

  const fetchPrizes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('position', { ascending: true });

      if (data && data.length > 0) {
        setPrizes(data);
        setEditedPrizes(JSON.parse(JSON.stringify(data)));
      } else {
        // Table exists but empty, insert defaults
        setPrizes(DEFAULT_PRIZES);
        setEditedPrizes(JSON.parse(JSON.stringify(DEFAULT_PRIZES)));
      }
    } catch (err) {
      console.warn("Table 'prizes' not found or inaccessible. Falling back to local default prizes.", err);
      // Fail gracefully: keep DEFAULT_PRIZES
      setPrizes(DEFAULT_PRIZES);
      setEditedPrizes(JSON.parse(JSON.stringify(DEFAULT_PRIZES)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  const handleEditChange = (index: number, field: keyof Prize, value: any) => {
    setEditedPrizes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleEditChange(index, 'image_url', reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Loop and update each prize in database
      for (const ep of editedPrizes) {
        const payload = {
          title: ep.title,
          description: ep.description,
          image_url: ep.image_url
        };

        // Try updating by position
        const { error } = await supabase
          .from('prizes')
          .upsert({ position: ep.position, ...payload }, { onConflict: 'position' });
        
        if (error) throw error;
      }
      
      setPrizes(JSON.parse(JSON.stringify(editedPrizes)));
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Error saving prizes to database:", err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleCancel = () => {
    setEditedPrizes(JSON.parse(JSON.stringify(prizes)));
    setIsEditing(false);
  };

  const getPodiumOrder = () => {
    // Return in order [2nd, 1st, 3rd] for classic podium render
    const p1 = editedPrizes.find(p => p.position === 1) || DEFAULT_PRIZES[0];
    const p2 = editedPrizes.find(p => p.position === 2) || DEFAULT_PRIZES[1];
    const p3 = editedPrizes.find(p => p.position === 3) || DEFAULT_PRIZES[2];
    return [
      { prize: p2, idx: editedPrizes.findIndex(p => p.position === 2) },
      { prize: p1, idx: editedPrizes.findIndex(p => p.position === 1) },
      { prize: p3, idx: editedPrizes.findIndex(p => p.position === 3) }
    ];
  };

  const runnersUp = editedPrizes.filter(p => p.position === 4 || p.position === 5);

  const getMedalColor = (pos: number) => {
    if (pos === 1) return { text: 'text-[#F4C430]', border: 'border-[#F4C430]/40', bg: 'bg-[#F4C430]/10', label: '1º PUESTO — ORO' };
    if (pos === 2) return { text: 'text-slate-350', border: 'border-slate-500/30', bg: 'bg-slate-500/10', label: '2º PUESTO — PLATA' };
    return { text: 'text-amber-600', border: 'border-amber-700/30', bg: 'bg-amber-700/10', label: '3º PUESTO — BRONCE' };
  };

  const isSuperadmin = user?.role === 'Superadmin' || user?.isAdmin;

  if (isLoading) {
    return (
      <div className="bg-[#0b111a]/40 p-12 text-center rounded-2xl border border-slate-800 space-y-4 max-w-4xl mx-auto">
        <RefreshCw className="w-8 h-8 text-[#3CDBC0] mx-auto animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Cargando catálogo de premios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* View Header with Superadmin controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#3CDBC0]" /> Premios del Prode
          </h2>
          <p className="text-xs text-slate-450 mt-1">El reconocimiento a los mejores pronosticadores del torneo.</p>
        </div>

        {isSuperadmin && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B5FC7] hover:bg-[#5B5FC7]/90 text-white font-bold text-xs shadow-md shadow-[#5B5FC7]/20 transition-all active:scale-[0.98]"
              >
                <Edit3 className="w-4 h-4" />
                Editar Premios
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save Notifications */}
      {saveStatus === 'success' && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-mono shadow-inner animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Catálogo de premios actualizado y guardado correctamente en la base de datos!</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl flex items-center gap-2 text-red-300 text-xs font-mono shadow-inner animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Error al conectar con la base de datos. Se usaron los premios locales temporales.</span>
        </div>
      )}

      {/* 1. Dynamic Podium Layout [2nd, 1st, 3rd] */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4">
        {getPodiumOrder().map(({ prize, idx }) => {
          const medal = getMedalColor(prize.position);
          const isFirst = prize.position === 1;

          return (
            <div 
              key={prize.position} 
              className={`glass rounded-3xl p-5 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                isFirst 
                  ? 'border-[#F4C430]/30 shadow-[0_0_24px_rgba(244,196,48,0.06)] md:min-h-[380px] md:-translate-y-2' 
                  : 'border-[#5B5FC7]/10 md:min-h-[340px]'
              }`}
            >
              {/* Podium header badge */}
              <div className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider self-start mb-4 ${medal.bg} ${medal.text} ${medal.border}`}>
                {medal.label}
              </div>

              {/* Prize Image visualization */}
              <div className="w-full h-36 rounded-2xl overflow-hidden relative border border-[#5B5FC7]/10 mb-4 bg-slate-950 flex items-center justify-center shrink-0">
                <img 
                  src={prize.image_url} 
                  alt={prize.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                
                {/* Upload Image overlay in edit mode */}
                {isEditing && (
                  <label className="absolute inset-0 bg-[#0f0f23]/80 hover:bg-[#0f0f23]/90 flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none transition-colors border border-dashed border-[#3CDBC0]/40 rounded-2xl m-2">
                    <Image className="w-6 h-6 text-[#3CDBC0]" />
                    <span className="text-[9px] font-bold text-[#3CDBC0] uppercase tracking-wider">Subir Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(idx, file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Title & Description content block */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={prize.title}
                      onChange={(e) => handleEditChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#050512] border border-[#5B5FC7]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#3CDBC0]/50"
                      placeholder="Título del premio..."
                    />
                    <textarea
                      rows={2}
                      value={prize.description}
                      onChange={(e) => handleEditChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#050512] border border-[#5B5FC7]/20 rounded-xl text-[10px] text-slate-350 focus:outline-none focus:border-[#3CDBC0]/50 resize-none"
                      placeholder="Detalle o descripción..."
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-extrabold text-white text-sm tracking-wide">{prize.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{prize.description}</p>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* 2. Runners Up cards (4th and 5th places) */}
      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-white text-sm px-1 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#3CDBC0]" /> Consuelos del Podio
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {runnersUp.map((prize) => {
            const idx = editedPrizes.findIndex(p => p.position === prize.position);
            
            return (
              <div 
                key={prize.position} 
                className="glass rounded-2xl p-4 border border-[#5B5FC7]/10 flex gap-4 items-center"
              >
                {/* Consolation prize image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden relative border border-[#5B5FC7]/10 bg-slate-950 shrink-0 flex items-center justify-center">
                  <img 
                    src={prize.image_url} 
                    alt={prize.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Upload Overlay in edit mode */}
                  {isEditing && (
                    <label className="absolute inset-0 bg-[#0f0f23]/80 hover:bg-[#0f0f23]/95 flex flex-col items-center justify-center cursor-pointer select-none border border-dashed border-[#3CDBC0]/40 rounded-lg m-1">
                      <Image className="w-4 h-4 text-[#3CDBC0]" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(idx, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/40 text-slate-400 tracking-wider inline-block">
                    {prize.position}º PUESTO
                  </span>
                  
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={prize.title}
                        onChange={(e) => handleEditChange(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1 bg-[#050512] border border-[#5B5FC7]/20 rounded-lg text-2xs text-white focus:outline-none focus:border-[#3CDBC0]/50"
                        placeholder="Título..."
                      />
                      <input
                        type="text"
                        value={prize.description}
                        onChange={(e) => handleEditChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1 bg-[#050512] border border-[#5B5FC7]/20 rounded-lg text-[9px] text-slate-450 focus:outline-none focus:border-[#3CDBC0]/50"
                        placeholder="Descripción corta..."
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-extrabold text-white text-xs truncate">{prize.title}</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed truncate">{prize.description}</p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
