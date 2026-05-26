/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Check, Copy, MessageSquare, Flame } from 'lucide-react';
import { ChallengeTone } from '../types';

interface ChallengeBoxProps {
  tones: ChallengeTone[];
  currentToneId: string;
  onToneChange: (id: string) => void;
  messageText: string;
  onMessageTextChange: (text: string) => void;
}

export default function ChallengeBox({
  tones,
  currentToneId,
  onToneChange,
  messageText,
  onMessageTextChange
}: ChallengeBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const selectedTone = tones.find(t => t.id === currentToneId) || tones[0];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-display font-bold text-lg text-white">Generador de Desafío</h2>
              <p className="text-2xs text-slate-400">Publicar en el canal de Slack o Teams de la empresa</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-2xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20 font-semibold uppercase animate-pulse">
            <Flame className="w-3 h-3 text-emerald-400" /> +2 Ptos de Rivalidad
          </span>
        </div>

        {/* Tone Selector Buttons */}
        <div className="mb-5">
          <label className="block text-2xs uppercase tracking-wider font-mono text-slate-500 mb-2">
            Elegir Tonalidad de la IA:
          </label>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
            {tones.map((tone) => {
              const active = tone.id === currentToneId;
              return (
                <button
                  key={tone.id}
                  onClick={() => onToneChange(tone.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-b from-cyan-950/40 to-slate-950/60 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/10'
                      : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <span className="text-lg mb-1">{tone.emoji}</span>
                  <span className="text-[10px] font-semibold leading-tight line-clamp-1">
                    {tone.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message editor box */}
        <div className="space-y-2 relative">
          <div className="flex justify-between items-center text-2xs font-mono text-slate-500">
            <span>Vista Previa del Mensaje ({selectedTone.badge})</span>
            <span>Editable</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 focus-within:border-cyan-500/50 transition-all shadow-inner">
            {/* Soft decorative chat bubble header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800/60 text-3xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-red-400/80 shrink-0" />
              <span className="w-2 h-2 rounded-full bg-yellow-400/80 shrink-0" />
              <span className="w-2 h-2 rounded-full bg-green-400/80 shrink-0" />
              <span className="ml-1 tracking-tight select-none">#prode-mundial-copa</span>
            </div>
            
            <textarea
              value={messageText}
              onChange={(e) => onMessageTextChange(e.target.value)}
              className="w-full h-36 p-4 bg-transparent text-slate-200 text-xs md:text-sm leading-relaxed border-0 focus:ring-0 outline-none resize-none"
              placeholder="Escribe el mensaje de desafío acá..."
            />
          </div>
        </div>
      </div>

      {/* Footer Copy CTA buttons */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2">
          {/* Main Copy clipboard button */}
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer text-xs font-bold font-mono tracking-wide uppercase transition-all duration-300 ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20 animate-none'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-lg hover:shadow-cyan-500/10'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                ¡Mensaje Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar para Slack / Teams
              </>
            )}
          </button>
        </div>

        {/* Integration guides */}
        <div className="text-3xs text-center text-slate-500 font-mono tracking-tight leading-normal">
          Copialo y pegalo directamente en <span className="text-indigo-400 font-semibold text-4xs uppercase">Slack</span> o <span className="text-indigo-400 font-semibold text-4xs uppercase">Microsoft Teams</span> de tu empresa para agitar el avispero. 🔥 Cup de café sugerido.
        </div>
      </div>
    </div>
  );
}
