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

import UserHeader from './components/UserHeader';
import AuthWall from './components/AuthWall';
import SuperAdminSettings from './components/SuperAdminSettings';
import UserProfilePanel from './components/UserProfilePanel';
import { calculateMatchPoints } from './utils/points';
import { useAuth } from './context/AuthContext';

import { 
  Home,
  Target,
  Trophy,
  History
} from 'lucide-react';

type TabId = 'inicio' | 'pronosticos' | 'admin' | 'tabla' | 'slack' | 'historico' | 'json' | 'perfil';

export default function App() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [officialResults, setOfficialResults] = useState<Record<string, [number, number]>>({});
  const [currentToneId, setCurrentToneId] = useState<string>('analista');
  const [messageText, setMessageText] = useState<string>(CHALLENGE_TONES[0].message);
  
  const [allUsersData, setAllUsersData] = useState<{users: any[], preds: any[]}>({users: [], preds: []});

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const { data: preds } = await supabase.from('predictions').select('match_id, prediction').eq('user_id', user.id);
        if (preds && preds.length > 0) {
          const newMatches = INITIAL_MATCHES.map(m => {
            const p = preds.find(pred => pred.match_id === m.id);
            return p ? { ...m, prediction: p.prediction } : m;
          });
          setMatches(newMatches);
        } else {
          setMatches(INITIAL_MATCHES);
        }
      }
      const { data: offRes } = await supabase.from('official_results').select('match_id, result');
      if (offRes) {
        const offObj: Record<string, [number, number]> = {};
        offRes.forEach(r => offObj[r.match_id] = r.result);
        setOfficialResults(offObj);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: users } = await supabase.from('users').select('*');
      const { data: preds } = await supabase.from('predictions').select('*');
      if (users && preds) {
        setAllUsersData({users, preds});
      }
    };
    if (user) {
      fetchLeaderboard();
    }
  }, [user]); // Removed matches and officialResults to prevent extreme lag and multiple DB calls on every score change

  const handleChangeScore = (id: string, index: 0 | 1, value: number) => {
    setMatches((prevMatches) => {
      const newMatches = prevMatches.map((match) => {
        if (match.id === id) {
          const newPrediction = [...match.prediction] as [number, number];
          newPrediction[index] = value;
          
          if (user?.id) {
            supabase.from('predictions').upsert({
              user_id: user.id,
              match_id: id,
              prediction: newPrediction
            }, { onConflict: 'user_id, match_id' }).then();
          }

          return { ...match, prediction: newPrediction };
        }
        return match;
      });
      return newMatches;
    });
  };

  const handleUpdateOfficialResult = (id: string, index: 0 | 1, value: number) => {
    setOfficialResults(prev => {
      const updated = { ...prev };
      if (!updated[id]) updated[id] = [0, 0];
      updated[id][index] = value;
      
      supabase.from('official_results').upsert({
        match_id: id,
        result: updated[id]
      }, { onConflict: 'match_id' }).then();

      return updated;
    });
  };

  const handleResetMatches = async () => {
    setMatches(INITIAL_MATCHES);
    if (user?.id) {
      await supabase.from('predictions').delete().eq('user_id', user.id);
    }
  };

  const dynamicStandings = useMemo(() => {
    const registeredUsers = allUsersData.users || [];
    const allPreds = allUsersData.preds || [];
    
    const userEntries: StandingsEntry[] = registeredUsers.map((u: any) => {
      let points = 0;
      const uPreds = allPreds.filter(p => p.user_id === u.id);

      Object.keys(officialResults).forEach(matchId => {
        const pObj = uPreds.find((m: any) => m.match_id === matchId);
        if (pObj) {
          points += calculateMatchPoints(pObj.prediction, officialResults[matchId]);
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
    combined.sort((a, b) => b.points - a.points);
    return combined;
  }, [officialResults, allUsersData]);

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
    ...(user?.isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Target className="w-5 h-5 text-[#F4C430]" /> }] : []),
    { id: 'tabla', label: 'Ranking', icon: <Trophy className="w-5 h-5" /> },
    { id: 'historico', label: 'Historial', icon: <History className="w-5 h-5" /> },
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
              stats={BOT_STATS} 
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

          {activeTab === 'admin' && user?.isAdmin && (
            <div>
              <div className="bg-[#F4C430]/10 border border-[#F4C430]/40 flex items-center justify-center p-4 rounded-xl mb-4 text-[#F4C430] font-semibold text-sm shadow-xl">
                ⚠️ MODO ADMINISTRADOR: EDITANDO RESULTADOS OFICIALES
              </div>
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
            <HistoryAndStats historicalMatches={HISTORICAL_MATCHES} />
          )}


          {activeTab === 'perfil' && (
            <UserProfilePanel matches={matches} />
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

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-[#0f0f23]/95 backdrop-blur-md border-t border-[#5B5FC7]/15 z-50">
        <div className="flex items-center justify-around px-1 py-1">
          {[
            { id: 'inicio', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
            { id: 'pronosticos', icon: <Target className="w-5 h-5" />, label: 'Prode' },
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
