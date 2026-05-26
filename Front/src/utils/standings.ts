/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match } from '../types';

export interface GroupTeam {
  name: string;
  code: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export type GroupLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export const TEAMS_BY_GROUP: Record<GroupLetter, { name: string; code: string; flag: string }[]> = {
  A: [
    { name: 'México', code: 'MEX', flag: '🇲🇽' },
    { name: 'Sudáfrica', code: 'RSA', flag: '🇿🇦' },
    { name: 'República de Corea', code: 'KOR', flag: '🇰🇷' },
    { name: 'Chequia', code: 'CZE', flag: '🇨🇿' },
  ],
  B: [
    { name: 'Canadá', code: 'CAN', flag: '🇨🇦' },
    { name: 'Bosnia y Herzegovina', code: 'BIH', flag: '🇧🇦' },
    { name: 'Catar', code: 'QAT', flag: '🇶🇦' },
    { name: 'Suiza', code: 'SUI', flag: '🇨🇭' },
  ],
  C: [
    { name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
    { name: 'Marruecos', code: 'MAR', flag: '🇲🇦' },
    { name: 'Haití', code: 'HAI', flag: '🇭🇹' },
    { name: 'Escocia', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { name: 'EE. UU.', code: 'USA', flag: '🇺🇸' },
    { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
    { name: 'Australia', code: 'AUS', flag: '🇦🇺' },
    { name: 'Turquía', code: 'TUR', flag: '🇹🇷' },
  ],
  E: [
    { name: 'Alemania', code: 'GER', flag: '🇩🇪' },
    { name: 'Curazao', code: 'CUW', flag: '🇨🇼' },
    { name: 'Costa de Marfil', code: 'CIV', flag: '🇨🇮' },
    { name: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
  ],
  F: [
    { name: 'Países Bajos', code: 'NED', flag: '🇳🇱' },
    { name: 'Japón', code: 'JPN', flag: '🇯🇵' },
    { name: 'Suecia', code: 'SWE', flag: '🇸🇪' },
    { name: 'Túnez', code: 'TUN', flag: '🇹🇳' },
  ],
  G: [
    { name: 'Bélgica', code: 'BEL', flag: '🇧🇪' },
    { name: 'Egipto', code: 'EGY', flag: '🇪🇬' },
    { name: 'RI de Irán', code: 'IRN', flag: '🇮🇷' },
    { name: 'Nueva Zelanda', code: 'NZL', flag: '🇳🇿' },
  ],
  H: [
    { name: 'España', code: 'ESP', flag: '🇪🇸' },
    { name: 'Islas de Cabo Verde', code: 'CPV', flag: '🇨🇻' },
    { name: 'Arabia Saudí', code: 'KSA', flag: '🇸🇦' },
    { name: 'Uruguay', code: 'URU', flag: '🇺🇾' },
  ],
  I: [
    { name: 'Francia', code: 'FRA', flag: '🇫🇷' },
    { name: 'Senegal', code: 'SEN', flag: '🇸🇳' },
    { name: 'Irak', code: 'IRQ', flag: '🇮🇶' },
    { name: 'Noruega', code: 'NOR', flag: '🇳🇴' },
  ],
  J: [
    { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
    { name: 'Argelia', code: 'ALG', flag: '🇩🇿' },
    { name: 'Austria', code: 'AUT', flag: '🇦🇹' },
    { name: 'Jordania', code: 'JOR', flag: '🇯🇴' },
  ],
  K: [
    { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
    { name: 'RD Congo', code: 'COD', flag: '🇨🇩' },
    { name: 'Uzbekistán', code: 'UZB', flag: '🇺🇿' },
    { name: 'Colombia', code: 'COL', flag: '🇨🇴' },
  ],
  L: [
    { name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croacia', code: 'CRO', flag: '🇭🇷' },
    { name: 'Ghana', code: 'GHA', flag: '🇬🇭' },
    { name: 'Panamá', code: 'PAN', flag: '🇵🇦' },
  ],
};

export function calculateGroupStandings(matches: Match[], groupLetter: GroupLetter): GroupTeam[] {
  // Initialize teams in this group with zeroed metrics
  const teamsMap: Record<string, GroupTeam> = {};
  
  const defaultTeams = TEAMS_BY_GROUP[groupLetter];
  defaultTeams.forEach((t) => {
    teamsMap[t.code] = {
      name: t.name,
      code: t.code,
      flag: t.flag,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    };
  });

  // Filter matches belonging to this group
  const groupMatches = matches.filter((m) => m.group === groupLetter);

  groupMatches.forEach((m) => {
    const local = teamsMap[m.localCode];
    const visitor = teamsMap[m.visitorCode];

    // If both team records exist, compile stats
    if (local && visitor) {
      const gLocal = m.prediction[0];
      const gVis = m.prediction[1];

      local.played += 1;
      visitor.played += 1;
      local.gf += gLocal;
      local.ga += gVis;
      visitor.gf += gVis;
      visitor.ga += gLocal;

      if (gLocal > gVis) {
        local.won += 1;
        local.points += 3;
        visitor.lost += 1;
      } else if (gLocal < gVis) {
        visitor.won += 1;
        visitor.points += 3;
        local.lost += 1;
      } else {
        local.drawn += 1;
        local.points += 1;
        visitor.drawn += 1;
        visitor.points += 1;
      }

      local.gd = local.gf - local.ga;
      visitor.gd = visitor.gf - visitor.ga;
    }
  });

  // Convert map to array and sort according to FIFA tournament criteria
  return Object.values(teamsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}
