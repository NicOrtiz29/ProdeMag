/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match } from './types';

import { TEAMS_BY_GROUP, GroupLetter } from './utils/standings';

// Generar los 72 partidos oficiales de la fase de grupos basados en los grupos reales (A - L) de la FIFA
const generateOfficialMatches = (): Match[] => {
  const matches: Match[] = [];
  const groupLetters: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  groupLetters.forEach((group) => {
    const teams = TEAMS_BY_GROUP[group];
    if (!teams || teams.length < 4) return;

    const [t0, t1, t2, t3] = teams;

    // Fecha 1: T0 vs T1, T2 vs T3
    matches.push({
      id: `${group}_F1_M1`,
      localTeam: t0.name,
      localCode: t0.code,
      visitorTeam: t1.name,
      visitorCode: t1.code,
      rivalry: group === 'A' || group === 'C' || group === 'J' || group === 'L' ? 'Alta' : 'Media',
      probabilityText: `Favorito ${t0.name}`,
      importance: `Gran choque inicial del Grupo ${group} en el Mundial 2026.`,
      prediction: [0, 0],
      flagLocal: t0.flag,
      flagVis: t1.flag,
      group,
      fecha: 1,
      hora: "18:00",
      lugar: "Estadio Nacional",
    });
    matches.push({
      id: `${group}_F1_M2`,
      localTeam: t2.name,
      localCode: t2.code,
      visitorTeam: t3.name,
      visitorCode: t3.code,
      rivalry: 'Baja',
      probabilityText: 'Pronóstico Reservado',
      importance: `Duelo clave en el Grupo ${group} para acomodarse en la tabla.`,
      prediction: [0, 0],
      flagLocal: t2.flag,
      flagVis: t3.flag,
      group,
      fecha: 1,
      hora: "18:00",
      lugar: "Estadio Nacional",
    });

    // Fecha 2: T0 vs T2, T1 vs T3
    matches.push({
      id: `${group}_F2_M1`,
      localTeam: t0.name,
      localCode: t0.code,
      visitorTeam: t2.name,
      visitorCode: t2.code,
      rivalry: 'Media',
      probabilityText: `Favorable a ${t0.name}`,
      importance: `Fase media del Grupo ${group}. Clave para asentar la clasificación.`,
      prediction: [0, 0],
      flagLocal: t0.flag,
      flagVis: t2.flag,
      group,
      fecha: 2,
      hora: "18:00",
      lugar: "Estadio Nacional",
    });
    matches.push({
      id: `${group}_F2_M2`,
      localTeam: t1.name,
      localCode: t1.code,
      visitorTeam: t3.name,
      visitorCode: t3.code,
      rivalry: 'Media',
      probabilityText: `Favorable a ${t3.name}`,
      importance: `Frenético choque del Grupo ${group} buscando esquivar la eliminación.`,
      prediction: [0, 0],
      flagLocal: t1.flag,
      flagVis: t3.flag,
      group,
      fecha: 2,
      hora: "18:00",
      lugar: "Estadio Nacional",
    });

    // Fecha 3: T3 vs T0, T1 vs T2
    matches.push({
      id: `${group}_F3_M1`,
      localTeam: t3.name,
      localCode: t3.code,
      visitorTeam: t0.name,
      visitorCode: t0.code,
      rivalry: 'Alta',
      probabilityText: `Favorito ${t0.name}`,
      importance: `Definición estelar de cierre para el Grupo ${group}.`,
      prediction: [0, 0],
      flagLocal: t3.flag,
      flagVis: t0.flag,
      group,
      fecha: 3,
      hora: "18:00",
      lugar: "Estadio Nacional",
    });
    matches.push({
      id: `${group}_F3_M2`,
      localTeam: t1.name,
      localCode: t1.code,
      visitorTeam: t2.name,
      visitorCode: t2.code,
      rivalry: 'Alta',
      probabilityText: 'Parejo / Empate',
      importance: `Último tren para pescar el billete a octavos en el Grupo ${group}.`,
      prediction: [0, 0],
      flagLocal: t1.flag,
      flagVis: t2.flag,
      group,
      fecha: 3,
      hora: "18:00",
      lugar: "Estadio Nacional",
    });
  });

  return matches;
};

import worldCupMatches from './data/worldcup2026.json';

// Usar los partidos cargados desde el dataset oficial del mundial 2026
export const INITIAL_MATCHES: Match[] = worldCupMatches as Match[];
