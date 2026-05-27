import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * SuperAdminSettings – UI for configuring scoring rules.
 * Responsive layout using Tailwind grid and full‑width inputs.
 */
export default function SuperAdminSettings() {
  const [pointsExact, setPointsExact] = useState<number>(5);
  const [pointsWinner, setPointsWinner] = useState<number>(2);
  const [pointsFormation, setPointsFormation] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load existing settings (creates row if missing)
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (!error && data) {
        setPointsExact(data.points_exact ?? 5);
        setPointsWinner(data.points_winner ?? 2);
        setPointsFormation(data.points_formation ?? 1);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('settings')
      .upsert(
        {
          id: 1,
          points_exact: pointsExact,
          points_winner: pointsWinner,
          points_formation: pointsFormation,
        },
        { onConflict: 'id' }
      );
    setLoading(false);
    setMessage(error ? `❌ ${error.message}` : '✅ Settings saved');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-[#0b111a]/80 border border-[#5B5FC7]/30 rounded-xl p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-[#3CDBC0]">Configuración de puntos (Super‑admin)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-slate-300 mb-1">Puntos por acierto exacto</span>
          <input
            type="number"
            min={0}
            value={pointsExact}
            onChange={e => setPointsExact(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0f0f23] border border-[#5B5FC7]/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3CDBC0]"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm text-slate-300 mb-1">Puntos por ganador correcto</span>
          <input
            type="number"
            min={0}
            value={pointsWinner}
            onChange={e => setPointsWinner(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0f0f23] border border-[#5B5FC7]/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3CDBC0]"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm text-slate-300 mb-1">Puntos por formación correcta</span>
          <input
            type="number"
            min={0}
            value={pointsFormation}
            onChange={e => setPointsFormation(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#0f0f23] border border-[#5B5FC7]/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3CDBC0]"
          />
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-4 w-full md:w-auto px-4 py-2 bg-[#3CDBC0] hover:bg-[#3CDBC0]/90 text-white rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar configuración'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
