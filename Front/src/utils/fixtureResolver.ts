/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match } from '../types';
import { calculateGroupStandings, GroupLetter, GroupTeam } from './standings';

// Helper to get flags for teams
const flags: Record<string, string> = {
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'República de Corea': '🇰🇷', 'Chequia': '🇨🇿',
  'Canadá': '🇨🇦', 'Bosnia y Herzegovina': '🇧🇦', 'Catar': '🇶🇦', 'Suiza': '🇨🇭',
  'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'EE. UU.': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
  'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'Costa de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
  'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Suecia': '🇸🇪', 'Túnez': '🇹🇹',
  'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'RI de Irán': '🇮🇷', 'Nueva Zelanda': '🇳🇿',
  'España': '🇪🇸', 'Islas de Cabo Verde': '🇨🇻', 'Arabia Saudí': '🇸🇦', 'Uruguay': '🇺🇾',
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noruega': '🇳🇴',
  'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇯🇴',
  'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbekistán': '🇺🇿', 'Colombia': '🇨🇴',
  'Inglaterra': '🏴\u200d🏴\u200d☠️\u200d', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦'
};

const getFlag = (teamName: string): string => {
  if (!teamName) return '⚽';
  return flags[teamName] || '⚽';
};

const getTeamCode = (name: string): string => {
  if (!name) return '';
  const codes: Record<string, string> = {
    'México': 'MEX', 'Sudáfrica': 'RSA', 'República de Corea': 'KOR', 'Chequia': 'CZE',
    'Canadá': 'CAN', 'Bosnia y Herzegovina': 'BIH', 'Catar': 'QAT', 'Suiza': 'SUI',
    'Brasil': 'BRA', 'Marruecos': 'MAR', 'Haití': 'HAI', 'Escocia': 'SCO',
    'EE. UU.': 'USA', 'Paraguay': 'PAR', 'Australia': 'AUS', 'Turquía': 'TUR',
    'Alemania': 'GER', 'Curazao': 'CUW', 'Costa de Marfil': 'CIV', 'Ecuador': 'ECU',
    'Países Bajos': 'NED', 'Japón': 'JPN', 'Suecia': 'SWE', 'Túnez': 'TUN',
    'Bélgica': 'BEL', 'Egipto': 'EGY', 'RI de Irán': 'IRN', 'Nueva Zelanda': 'NZL',
    'España': 'ESP', 'Islas de Cabo Verde': 'CPV', 'Arabia Saudí': 'KSA', 'Uruguay': 'URU',
    'Francia': 'FRA', 'Senegal': 'SEN', 'Irak': 'IRQ', 'Noruega': 'NOR',
    'Argentina': 'ARG', 'Argelia': 'ALG', 'Austria': 'AUT', 'Jordania': 'JOR',
    'Portugal': 'POR', 'RD Congo': 'COD', 'Uzbekistán': 'UZB', 'Colombia': 'COL',
    'Inglaterra': 'ENG', 'Croacia': 'CRO', 'Ghana': 'GHA', 'Panamá': 'PAN'
  };
  return codes[name] || name.substring(0, 3).toUpperCase();
};

export interface ResolvedMatch extends Match {
  resolvedLocal?: { name: string; code: string; flag: string };
  resolvedVisitor?: { name: string; code: string; flag: string };
  winnerId?: string; // 'local' | 'visitor'
}

export function resolveFixture(
  matches: Match[],
  useOfficial: boolean,
  officialResults: Record<string, [number, number]>
): ResolvedMatch[] {
  // Deep clone matches to prevent mutation
  const resolved: ResolvedMatch[] = JSON.parse(JSON.stringify(matches));

  // 1. Calculate Group Standings
  const groups: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const standings: Record<GroupLetter, GroupTeam[]> = {} as any;
  const thirdPlaces: GroupTeam[] = [];

  groups.forEach((g) => {
    // Determine scores used for group stage: official or predicted
    const groupMatches = resolved.filter((m) => m.group === g);
    groupMatches.forEach((m) => {
      if (useOfficial && officialResults[m.id]) {
        m.prediction = officialResults[m.id];
      }
    });

    const groupStandings = calculateGroupStandings(groupMatches, g);
    standings[g] = groupStandings;
    if (groupStandings[2]) {
      thirdPlaces.push(groupStandings[2]);
    }
  });

  // Sort third places: points, GD, GF, name
  thirdPlaces.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  const qualifiedThirds = thirdPlaces.slice(0, 8);

  // 2. Assign Third Places to R32 slots
  // Match 74: 3A/B/C/D/F
  // Match 77: 3C/D/F/G/H
  // Match 79: 3C/E/F/H/I
  // Match 80: 3E/H/I/J/K
  // Match 81: 3B/E/F/I/J
  // Match 82: 3A/E/H/I/J
  // Match 85: 3E/F/G/I/J
  // Match 87: 3D/E/I/J/L
  const thirdPlaceSlots = [
    { matchFecha: 74, allowedGroups: ['A', 'B', 'C', 'D', 'F'] },
    { matchFecha: 77, allowedGroups: ['C', 'D', 'F', 'G', 'H'] },
    { matchFecha: 79, allowedGroups: ['C', 'E', 'F', 'H', 'I'] },
    { matchFecha: 80, allowedGroups: ['E', 'H', 'I', 'J', 'K'] },
    { matchFecha: 81, allowedGroups: ['B', 'E', 'F', 'I', 'J'] },
    { matchFecha: 82, allowedGroups: ['A', 'E', 'H', 'I', 'J'] },
    { matchFecha: 85, allowedGroups: ['E', 'F', 'G', 'I', 'J'] },
    { matchFecha: 87, allowedGroups: ['D', 'E', 'I', 'J', 'L'] },
  ];

  const assignedThirds: Record<number, GroupTeam> = {};
  const usedThirdCodes = new Set<string>();

  thirdPlaceSlots.forEach((slot) => {
    // Find the best qualified 3rd place from allowed groups that isn't used yet
    const found = qualifiedThirds.find(
      (t) => {
        // Find which group this team belongs to
        const teamGroup = groups.find(g => standings[g].some(st => st.code === t.code));
        return teamGroup && slot.allowedGroups.includes(teamGroup) && !usedThirdCodes.has(t.code);
      }
    );

    if (found) {
      assignedThirds[slot.matchFecha] = found;
      usedThirdCodes.add(found.code);
    } else {
      // Fallback: pick the highest ranked unassigned qualified 3rd place
      const fallback = qualifiedThirds.find((t) => !usedThirdCodes.has(t.code));
      if (fallback) {
        assignedThirds[slot.matchFecha] = fallback;
        usedThirdCodes.add(fallback.code);
      }
    }
  });

  // Helper to get winner/loser of a resolved match
  const getMatchOutcome = (m: ResolvedMatch): { winner?: { name: string; code: string; flag: string }; loser?: { name: string; code: string; flag: string } } => {
    const local = m.resolvedLocal;
    const visitor = m.resolvedVisitor;
    if (!local || !visitor) return {};

    const score = useOfficial && officialResults[m.id] ? officialResults[m.id] : m.prediction;
    const [lScore, vScore] = score;

    if (lScore > vScore) {
      return { winner: local, loser: visitor };
    } else if (vScore > lScore) {
      return { winner: visitor, loser: local };
    } else {
      // Tie breaker in prode/predictions: default to local team for single-elimination progression
      return { winner: local, loser: visitor };
    }
  };

  // Helper to resolve a team reference (e.g. "1A", "2B", "W74", "L101")
  const resolveTeamRef = (ref: string, currentMatchFecha: number): { name: string; code: string; flag: string } | undefined => {
    if (!ref) return undefined;

    // 1. Group winners/runners-up (e.g. 1A, 2B)
    const groupMatch = ref.match(/^([12])([A-L])$/);
    if (groupMatch) {
      const position = parseInt(groupMatch[1], 10);
      const groupLetter = groupMatch[2] as GroupLetter;
      const team = standings[groupLetter]?.[position - 1];
      if (team) {
        return { name: team.name, code: team.code, flag: team.flag };
      }
      return undefined;
    }

    // 2. Third place slot
    if (ref.startsWith('3')) {
      const team = assignedThirds[currentMatchFecha];
      if (team) {
        return { name: team.name, code: team.code, flag: team.flag };
      }
      return undefined;
    }

    // 3. Winner of a match (e.g. W74)
    if (ref.startsWith('W')) {
      const parentFecha = parseInt(ref.substring(1), 10);
      const parentMatch = resolved.find((m) => m.fecha === parentFecha);
      if (parentMatch) {
        const { winner } = getMatchOutcome(parentMatch);
        return winner;
      }
      return undefined;
    }

    // 4. Loser of a match (e.g. L101)
    if (ref.startsWith('L')) {
      const parentFecha = parseInt(ref.substring(1), 10);
      const parentMatch = resolved.find((m) => m.fecha === parentFecha);
      if (parentMatch) {
        const { loser } = getMatchOutcome(parentMatch);
        return loser;
      }
      return undefined;
    }

    // 5. Already a real country name
    return { name: ref, code: getTeamCode(ref), flag: getFlag(ref) };
  };

  // Resolve knockout stages in chronological order (fecha 73 to 104)
  resolved.sort((a, b) => a.fecha - b.fecha);

  resolved.forEach((m) => {
    if (m.fecha >= 73) {
      const loc = resolveTeamRef(m.localTeam, m.fecha);
      const vis = resolveTeamRef(m.visitorTeam, m.fecha);

      if (loc) {
        m.resolvedLocal = loc;
        m.localTeam = loc.name;
        m.localCode = loc.code;
        m.flagLocal = loc.flag;
      }
      if (vis) {
        m.resolvedVisitor = vis;
        m.visitorTeam = vis.name;
        m.visitorCode = vis.code;
        m.flagVis = vis.flag;
      }

      // Compute winner
      if (loc && vis) {
        const score = useOfficial && officialResults[m.id] ? officialResults[m.id] : m.prediction;
        m.winnerId = score[0] >= score[1] ? 'local' : 'visitor';
      }
    } else {
      // Group stages
      m.resolvedLocal = { name: m.localTeam, code: m.localCode, flag: getFlag(m.localTeam) };
      m.resolvedVisitor = { name: m.visitorTeam, code: m.visitorCode, flag: getFlag(m.visitorTeam) };
    }
  });

  return resolved;
}
