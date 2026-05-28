import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';

const SOURCE_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const OUTPUT_PATH = './src/data/worldcup2026.json';

interface RawMatch {
  round: string;
  date: string; // e.g. "2026-06-11"
  time: string; // e.g. "13:00 UTC-6"
  team1: string;
  team2: string;
  group: string; // e.g. "Group A"
  ground: string;
}

interface WorldCupData {
  name: string;
  matches: RawMatch[];
}

// Mapeo simple de nombre de equipo -> código ISO de país (para bandera emoji)
const TEAM_TO_COUNTRY: Record<string, string> = {
  Mexico: 'MX',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  'Czech Republic': 'CZ',
  Canada: 'CA',
  'Bosnia & Herzegovina': 'BA',
  Qatar: 'QA',
  Switzerland: 'CH',
  // Agregar más equipos según sea necesario
};

function countryCodeToEmoji(code: string): string {
  if (!code) return '';
  const A = 0x1f1e6; // Regional indicator symbol letter A
  const upper = code.toUpperCase();
  const first = String.fromCodePoint(A + upper.charCodeAt(0) - 65);
  const second = String.fromCodePoint(A + upper.charCodeAt(1) - 65);
  return first + second;
}

async function importMatches() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to fetch ${SOURCE_URL}: ${res.statusText}`);
  const data = (await res.json()) as WorldCupData;

  const transformed = data.matches.map((m, idx) => {
    const groupLetter = m.group ? m.group.split(' ')[1] : 'A';
    const timeOnly = m.time ? m.time.split(' ')[0] : '';
    const localCode = TEAM_TO_COUNTRY[m.team1] ?? '';
    const visitorCode = TEAM_TO_COUNTRY[m.team2] ?? '';
    const flagLocal = countryCodeToEmoji(localCode);
    const flagVis = countryCodeToEmoji(visitorCode);
    return {
      id: `${groupLetter}_M${idx + 1}`,
      localTeam: m.team1,
      localCode,
      visitorTeam: m.team2,
      visitorCode,
      rivalry: 'Media',
      probabilityText: '',
      importance: '',
      prediction: [0, 0] as [number, number],
      flagLocal,
      flagVis,
      group: groupLetter as any,
      fecha: idx + 1,
      hora: timeOnly,
      lugar: m.ground,
    };
  });

  await writeFile(OUTPUT_PATH, JSON.stringify(transformed, null, 2), 'utf-8');
  console.log(`✅ ${transformed.length} partidos escritos en ${OUTPUT_PATH}`);
}

importMatches().catch(err => {
  console.error('Error importing matches:', err);
  process.exit(1);
});
