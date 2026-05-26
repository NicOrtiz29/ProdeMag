/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Code, Copy, Check, Info } from 'lucide-react';
import { Match } from '../types';

interface JsonViewerProps {
  matches: Match[];
  messageText: string;
}

export default function JsonViewer({ matches, messageText }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  // Compile the dynamic JSON structure based on current state
  const compiledJsonObj = {
    predicciones: {
      P1_ARG_ARA: [matches[0].prediction[0], matches[0].prediction[1]],
      P2_DIN_TUN: [matches[1].prediction[0], matches[1].prediction[1]],
      P3_MEX_POL: [matches[2].prediction[0], matches[2].prediction[1]],
      P4_FRA_AUS: [matches[3].prediction[0], matches[3].prediction[1]],
    },
    mensaje_desafio: messageText
  };

  const jsonString = JSON.stringify(compiledJsonObj, null, 2);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying JSON:', err);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="font-display font-bold text-lg text-white">JSON de Salida (Formato Requerido)</h2>
            <p className="text-2xs text-slate-400">Sincronizado en tiempo real con tus interacciones</p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopyJson}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-mono text-2xs font-bold leading-none uppercase ${
            copied
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 stroke-[2.5px]" />
              JSON Copiado
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copiar JSON
            </>
          )}
        </button>
      </div>

      {/* Info notice about how the JSON matches the prompt request */}
      <div className="bg-purple-950/20 border border-purple-500/15 rounded-xl p-3 mb-4 flex items-start gap-2 text-2xs text-purple-300 leading-normal font-sans">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <span>
          Este panel expone el <strong className="text-purple-200">objeto JSON formal</strong> solicitado en la consigna. Cualquier cambio que hagas en los partidos o en el selector de tonos del desafío se impacta inmediatamente aquí. ¡Listo para copiar e integrar!
        </span>
      </div>

      {/* Code window */}
      <div className="relative rounded-xl overflow-hidden border border-slate-805/90 bg-[#06090e] shadow-inner font-mono text-xs text-slate-300 p-4 leading-relaxed overflow-x-auto">
        {/* Soft styling accents */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 select-none pointer-events-none text-4xs uppercase tracking-wider text-slate-600 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> RAW DATA
        </div>

        <pre className="whitespace-pre-wrap word-break" id="json-codeblock">
          <code className="text-[11px] leading-tight">
            {/* Super simple markup highlight for values just with spans */}
            <span className="text-slate-500">{`{`}</span>
            {`\n  `}
            <span className="text-purple-400">"predicciones"</span>
            {`: `}
            <span className="text-slate-500">{`{`}</span>
            {`\n    `}
            <span className="text-cyan-400">"P1_ARG_ARA"</span>
            {`: [`}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P1_ARG_ARA[0]}</span>
            {`, `}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P1_ARG_ARA[1]}</span>
            {`],\n    `}
            <span className="text-cyan-400">"P2_DIN_TUN"</span>
            {`: [`}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P2_DIN_TUN[0]}</span>
            {`, `}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P2_DIN_TUN[1]}</span>
            {`],\n    `}
            <span className="text-cyan-400">"P3_MEX_POL"</span>
            {`: [`}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P3_MEX_POL[0]}</span>
            {`, `}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P3_MEX_POL[1]}</span>
            {`],\n    `}
            <span className="text-cyan-400">"P4_FRA_AUS"</span>
            {`: [`}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P4_FRA_AUS[0]}</span>
            {`, `}
            <span className="text-amber-400 font-bold">{compiledJsonObj.predicciones.P4_FRA_AUS[1]}</span>
            {`]\n  `}
            <span className="text-slate-500">{`}`}</span>
            {`,\n  `}
            <span className="text-purple-400">"mensaje_desafio"</span>
            {`: `}
            <span className="text-emerald-400">"{compiledJsonObj.mensaje_desafio}"</span>
            {`\n`}
            <span className="text-slate-500">{`}`}</span>
          </code>
        </pre>
      </div>
    </div>
  );
}
