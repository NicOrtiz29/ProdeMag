/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_MATCHES, CHALLENGE_TONES, BOT_STATS, HISTORICAL_MATCHES } from './data';
import { Match, StandingsEntry } from './types';

import DashboardView from './components/DashboardView';
import PredictionsList from './components/PredictionsList';
import DetailedStandings from './components/DetailedStandings';
import HistoryAndStats from './components/HistoryAndStats';
import FixtureBracket from './components/FixtureBracket';
import PremiosView from './components/PremiosView';

import UserHeader from './components/UserHeader';
import AuthWall from './components/AuthWall';
import SuperAdminSettings from './components/SuperAdminSettings';
import UserProfilePanel from './components/UserProfilePanel';
import { calculateMatchPoints } from './utils/points';
import { useAuth } from './context/AuthContext';
import ChatWidget from './components/ChatWidget';
import { supabase } from './lib/supabase';

import { 
  Home,
  Target,
  Trophy,
  History,
  GitFork,
  Gift
} from 'lucide-react';

type TabId = 'inicio' | 'pronosticos' | 'fixture' | 'admin' | 'tabla' | 'slack' | 'historico' | 'json' | 'perfil' | 'premios';

export default function App() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [officialResults, setOfficialResults] = useState<Record<string, [number, number]>>({});
  const [currentToneId, setCurrentToneId] = useState<string>('analista');
  const [messageText, setMessageText] = useState<string>(CHALLENGE_TONES[0].message);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [allUsersData, setAllUsersData] = useState<{users:any[], preds:any[]}>({users: [], preds: []});

  // --------------------------------------------------
  // Load all required data (official results, users, predictions)
  // --------------------------------------------------
  const loadAllData = async () => {
    // 1️⃣ Official results
    const { data: offRes, error: offErr } = await supabase.from('official_results').select('match_id, result');
    if (offErr) {
      console.error('Error loading official results:', offErr);
    } else if (offRes) {
      const offObj: Record<string, [number, number]> = {};
      offRes.forEach(r => (offObj[r.match_id] = r.result));
      setOfficialResults(offObj);
      if (import.meta.env.DEV) console.log('Official results loaded:', offRes.length);
    }

    // 2️⃣ Users and predictions
    const { data: users, error: usersErr } = await supabase.from('users').select('*');
    const { data: preds, error: predsErr } = await supabase.from('predictions').select('*');
    if (usersErr) console.error('Error loading users:', usersErr);
    if (predsErr) console.error('Error loading predictions:', predsErr);
    if (users && preds) {
      if (import.meta.env.DEV) console.log('Fetched users:', users.length, 'predictions:', preds.length);
      setAllUsersData({ users, preds });
      // Merge current user's predictions into matches state
      if (user) {
        const userPreds = preds.filter(p => p.user_id === user.id);
        setMatches(prev =>
          prev.map(m => {
            const p = userPreds.find(up => String(up.match_id) === m.id);
            return p ? { ...m, prediction: p.prediction } : m;
          })
        );
      }
    }
  };

  // Run once when the authenticated user is available
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Helper to manually refresh leaderboard (kept for admin button)
  const fetchLeaderboard = async () => {
    // Re‑run loadAllData to keep data in sync
    await loadAllData();
  };

  const handleChangeScore = async (id: string, index: 0 | 1, value: number) => {
    const match = matches.find(m => m.id === id);
    if (!match || !user?.id) return;

    const newPrediction = [...match.prediction] as [number, number];
    newPrediction[index] = value;

    // 1. Optimistic UI update
    setMatches((prev) => prev.map(m => m.id === id ? { ...m, prediction: newPrediction } : m));

    // 2. Call API
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ match_id: id, prediction: newPrediction }),
      });
      
      // 3. Refresh data
      await fetchLeaderboard();
    } catch (error) {
      console.error('Failed to update prediction:', error);
    }
  };

  const handleUpdateOfficialResult = async (id: string, index: 0 | 1, value: number) => {
    // Optimistically update UI
    setOfficialResults(prev => {
      const updated = { ...prev };
      if (!updated[id]) updated[id] = [0, 0];
      updated[id][index] = value;
      return updated;
    });

    // Send update to API (admin only)
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/official-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ match_id: id, result: (officialResults[id] || [0, 0]).map((v, i) => i === index ? value : v) }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Failed to update result'); });
        }
        return res.json();
      })
      .then(() => loadAllData())
      .catch(err => console.error('Official result API error:', err));
  };

  const handleResetMatches = async () => {
    setMatches(INITIAL_MATCHES);
    // Intentionally retain user predictions; do not clear them
  };

  const dynamicStandings = useMemo(() => {
    const registeredUsers = allUsersData.users || [];
    const allPreds = allUsersData.preds || [];
    
    const userEntries: StandingsEntry[] = registeredUsers.map((u: any) => {
      let points = 0;
      const uPreds = allPreds.filter(p => p.user_id === u.id);

      Object.keys(officialResults).forEach(matchId => {
        const matchObj = matches.find(m => m.id === matchId);
        if (matchObj && matchObj.fecha < 73) {
          const pObj = uPreds.find((m: any) => m.match_id === matchId);
          if (pObj) {
            points += calculateMatchPoints(pObj.prediction, officialResults[matchId]);
          }
        }
      });

      return {
        id: u.id,
        name: u.name,
        points: points,
        isBot: false,
        avatar: u.avatar || '⚽',
        role: u.role,
        province: u.province
      };
    });

    const combined = userEntries;
    // Debug logs
    if (import.meta.env.DEV) console.log('User entries count:', userEntries.length);
    if (import.meta.env.DEV) console.log('Official results keys:', Object.keys(officialResults));
    combined.sort((a, b) => b.points - a.points);
    // Log after sorting
    if (import.meta.env.DEV) console.log('Sorted standings count:', combined.length);
    return combined;
  }, [officialResults, allUsersData]);

  // Log when dynamicStandings recompute
  useEffect(() => {
    if (import.meta.env.DEV) console.log('Dynamic standings recomputed, count:', dynamicStandings.length);
  }, [dynamicStandings]);

  const handleToneChange = (toneId: string) => {
    setCurrentToneId(toneId);
    const targetTone = CHALLENGE_TONES.find((t) => t.id === toneId);
    if (targetTone) {
      setMessageText(targetTone.message);
    }
  };

  const handleMessageTextChange = (text: string) => {
    setMessageText(text);
  };

  // Tab definitions
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'pronosticos', label: 'Pronósticos', icon: <Target className="w-5 h-5" /> },
    { id: 'fixture', label: 'Fixture', icon: <GitFork className="w-5 h-5 text-[#3CDBC0]" /> },
    ...(user?.isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Target className="w-5 h-5 text-[#F4C430]" /> }] : []),
    { id: 'tabla', label: 'Ranking', icon: <Trophy className="w-5 h-5" /> },
    { id: 'historico', label: 'Historial', icon: <History className="w-5 h-5" /> },
    { id: 'premios', label: 'Premios', icon: <Gift className="w-5 h-5 text-[#3CDBC0]" /> },
  ] as const;

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-[#3CDBC0] border-r-[#5B5FC7] border-b-[#75AADB] border-l-transparent animate-spin mx-auto" />
          <p className="text-[#3CDBC0] text-sm font-medium animate-pulse">Cargando Prode MagIA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWall />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] pb-24 sm:pb-16 transition-all relative">
      
      {/* Argentina top stripe */}
      <div className="absolute top-0 inset-x-0 h-1.5 flex opacity-90">
        <div className="flex-1 bg-[#75AADB]" />
        <div className="w-1/6 bg-white" />
        <div className="flex-1 bg-[#75AADB]" />
        <div className="w-1/6 bg-white" />
        <div className="flex-1 bg-[#75AADB]" />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        
        <UserHeader onNavigate={() => setActiveTab('perfil')} />
        
        {/* Desktop Tabs */}
        <div className="hidden sm:block border-b border-[#5B5FC7]/10 pb-px">
          <nav className="flex flex-wrap items-center gap-1 -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all rounded-t-xl ${
                    active
                      ? 'border-[#3CDBC0] text-[#3CDBC0] bg-[#3CDBC0]/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          {activeTab === 'inicio' && (
            <DashboardView 
              matches={matches} 
              standings={dynamicStandings} 
              officialResults={officialResults} 
              onNavigateToTab={(id) => setActiveTab(id as TabId)}
            />
          )}

          {activeTab === 'pronosticos' && (
            <PredictionsList 
              matches={matches} 
              onChangeScore={handleChangeScore} 
              onResetMatches={handleResetMatches} 
            />
          )}

          {activeTab === 'fixture' && (
            <FixtureBracket 
              matches={matches} 
              officialResults={officialResults} 
              onChangeScore={handleChangeScore} 
            />
          )}
{activeTab === 'admin' && user?.isAdmin && (
  <div>
    {/* Aviso de modo admin */}
    <div className="bg-[#F4C430]/10 border border-[#F4C430]/40 flex items-center justify-center p-4 rounded-xl mb-4 text-[#F4C430] font-semibold text-sm shadow-xl">
      ⚠️ MODO ADMINISTRADOR: EDITANDO RESULTADOS OFICIALES
    </div>

    {/* Botón de refresco manual */}
      <button
        onClick={async () => {
          setIsSpinning(true);
          const { data: offRes } = await supabase
            .from('official_results')
            .select('match_id, result');
          if (offRes) {
            const offObj: Record<string, [number, number]> = {};
            offRes.forEach(r => (offObj[r.match_id] = r.result));
            setOfficialResults(offObj);
          }
          setTimeout(() => setIsSpinning(false), 800);
        }}
        className="mb-2 px-3 py-1.5 rounded-xl bg-[#1a1a2e] hover:bg-[#1a1a2e]/80 text-slate-300"
      >
        <span className={"ball " + (isSpinning ? "spin" : "")}>🔄</span>
        {isSpinning ? "" : " Refrescar oficiales"}
      </button>

    {/* Lista de partidos con edición de resultados oficiales */}
    <PredictionsList
      matches={matches}
      officialResults={officialResults}
      isEditingOfficial={true}
      onChangeScore={handleUpdateOfficialResult}
      onResetMatches={() => {}}
    />
  </div>
)}
          

          {activeTab === 'tabla' && (
            <DetailedStandings standings={dynamicStandings} />
          )}

          {activeTab === 'historico' && (
            <HistoryAndStats historicalMatches={HISTORICAL_MATCHES} standings={dynamicStandings} />
          )}

          {activeTab === 'premios' && (
            <PremiosView />
          )}

          {activeTab === 'perfil' && (
            <UserProfilePanel matches={matches} standings={dynamicStandings} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center pt-6 border-t border-[#5B5FC7]/10 space-y-1 pb-4">
          <p className="text-xs text-slate-600">
            Hecho con 💜 por <span className="font-bold">MAG</span>
          </p>
          <p className="text-[10px] text-slate-700">
            Prode MagIA © 2026 — Mundial FIFA 2026
          </p>
        </footer>
      </div>
      <ChatWidget />

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-[#0f0f23]/95 backdrop-blur-md border-t border-[#5B5FC7]/15 z-50">
        <div className="flex items-center justify-around px-1 py-1">
          {[
            { id: 'inicio', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
            { id: 'pronosticos', icon: <Target className="w-5 h-5" />, label: 'Prode' },
            { id: 'fixture', icon: <GitFork className="w-5 h-5" />, label: 'Fixture' },
            { id: 'tabla', icon: <Trophy className="w-5 h-5" />, label: 'Ranking' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all ${
                  active
                    ? 'text-[#3CDBC0] bg-[#3CDBC0]/10'
                    : 'text-slate-500'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
