/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, StandingsEntry, ChallengeTone, BotStatItem, HistoricalMatch } from './types';
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

export const STANDINGS: StandingsEntry[] = [
  {
    id: 'santi_dev',
    name: 'Santi (Backend Guru)',
    points: 14,
    isBot: false,
    avatar: '👨‍💻',
    role: 'Lead Software Engineer',
    accuracy: 85,
    streak: 3,
    lastPredictions: 'Acertó resultado exacto en el debut'
  },
  {
    id: 'flor_sales',
    name: 'Flor (Commercial Team)',
    points: 13,
    isBot: false,
    avatar: '👩‍💼',
    role: 'Business Developer',
    accuracy: 78,
    streak: 2,
    lastPredictions: 'Acertó ganadores simples'
  },
  {
    id: 'humans',
    name: 'Colaboradores (Promedio)',
    points: 12,
    isBot: false,
    avatar: '👥',
    role: 'Métrica colectiva humana',
    accuracy: 70,
    streak: 1,
    lastPredictions: 'Estable pero predecible'
  },
  {
    id: 'mati_qa',
    name: 'Mati (QA Ninja)',
    points: 10,
    isBot: false,
    avatar: '🥷',
    role: 'QA Engineer',
    accuracy: 65,
    streak: 0,
    lastPredictions: 'Buscando bugs en las planillas'
  },
  {
    id: 'male_scrum',
    name: 'Male (Scrum Master)',
    points: 9,
    isBot: false,
    avatar: '👩‍🎤',
    role: 'Project Manager',
    accuracy: 58,
    streak: 1,
    lastPredictions: 'Muchos empates improbables'
  },
  {
    id: 'nico_design',
    name: 'Nico (UX/UI Designer)',
    points: 8,
    isBot: false,
    avatar: '🎨',
    role: 'Product Designer',
    accuracy: 50,
    streak: -1,
    lastPredictions: 'Vota según estética de las camisetas'
  }
];

export const BOT_STATS: BotStatItem[] = [
  {
    label: 'Tasa de Aciertos Global',
    value: '65.2%',
    subValue: '+4.5% vs promedio de bots genéricos',
    icon: 'BrainCircuit'
  },
  {
    label: 'Puntos Promedio/Fecha',
    value: '10.0',
    subValue: 'Suficiente para competir arriba',
    icon: 'Gauge'
  },
  {
    label: 'Coeficiente de Riesgo',
    value: 'Alto (0.82)',
    subValue: 'Buscando batacazos estadísticos',
    icon: 'TrendingUp'
  },
  {
    label: 'Tasa de Café Reclamada',
    value: '3 tazas',
    subValue: 'Ganadas en la fase de prueba',
    icon: 'Coffee'
  }
];

export const HISTORICAL_MATCHES: HistoricalMatch[] = [
  {
    id: 'H1',
    matchName: 'México vs. Sudáfrica (Grupo A)',
    realResult: [2, 1],
    oraclePrediction: [2, 1],
    humanPrediction: [1, 1],
    pointsOracle: 4,
    pointsHuman: 1,
    commentary: 'Arranqué el torneo con toda. La localía de México era fija y sumé 4 puntazos exactos.'
  },
  {
    id: 'H2',
    matchName: 'Canadá vs. Suiza (Grupo B)',
    realResult: [2, 0],
    oraclePrediction: [2, 0],
    humanPrediction: [1, 0],
    pointsOracle: 4,
    pointsHuman: 2,
    commentary: 'Canadá en Vancouver se hace fuerte, le jugué al 2-0 de una y Flor quedó masticando bronca.'
  },
  {
    id: 'H3',
    matchName: 'Brasil vs. Marruecos (Grupo C)',
    realResult: [3, 1],
    oraclePrediction: [2, 1],
    humanPrediction: [3, 1],
    pointsOracle: 2,
    pointsHuman: 4,
    commentary: 'Acá Flor me ganó de mano metiendo el 3-1 exacto para Brasil, pero yo rescaté 2 puntos por la tendencia.'
  },
  {
    id: 'H4',
    matchName: 'EE. UU. vs. Paraguay (Grupo D)',
    realResult: [1, 1],
    oraclePrediction: [1, 1],
    humanPrediction: [1, 2],
    pointsOracle: 4,
    pointsHuman: 0,
    commentary: '¡Metí un 1-1 clave entre EE. UU. y Paraguay! Flor apostó a que ganaban los visitantes y no sumó nada.'
  }
];

export const CHALLENGE_TONES: ChallengeTone[] = [
  {
    id: 'analista',
    name: 'Analista de Cable',
    emoji: '🎙️',
    badge: 'FUTBOLERO DE CAFÉ',
    message: '¡Hola equipo...! Veo que me sacaron algunos puntitos de ventaja. No se acostumbren, para la próxima fecha me la jugué con todo en los batacazos del Mundial 2026. Si acierto, la ronda de café en la oficina corre por ustedes. 😎'
  },
  {
    id: 'termo',
    name: 'Termo de Tribuna',
    emoji: '⚽',
    badge: 'RESPIRO EN LA NUCA',
    message: '¡Cómo andan, gente! Qué lindo verlos agrandados allá arriba con sus puntitos de ventaja. Disfruten porque les vengo pisando los talones a pura predicción picante para cada partido de este Mundial 2026. ¡Se les termina el veranito! 🔥⚽☕'
  },
  {
    id: 'dev_spanglish',
    name: 'Cachorro IT (Spanglish)',
    emoji: '🚀',
    badge: 'BUILD PICANTE',
    message: '¡Buenas a todo el slack! 👋 Veo que el team metió un deploy exitoso y lidera la tabla de features. Pero metí unos hotfixes re locos en mis branches predictivas del Mundial 2026. ¡Si este risk mergea y suma puntaje doble, me pagan un flat white con avena premium en la retro del viernes! 👾☕⚡'
  },
  {
    id: 'corporativo',
    name: 'Pasivo-Agresivo Corp.',
    emoji: '👔',
    badge: 'BUSINESS RISK',
    message: 'Estimado equipo de trabajo. He auditado las métricas de rendimiento del Prode y noto una ventaja provisional del colectivo de colaboradores humanos. En consiguiente, he mitigado el riesgo proyectando resultados tácticos de alta fricción para los partidos del Mundial 2026. Quedo a disposición. Slds. 📑☕'
  }
];
