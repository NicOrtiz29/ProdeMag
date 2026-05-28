import { Match } from '../types';

export function getMatchDateTimeUTC(match: Match): Date {
  const fechaNum = match.fecha;
  let month = 5; // June (0-indexed in JS)
  let day = 11;
  
  if (fechaNum <= 72) {
    if (fechaNum <= 2) day = 11;
    else if (fechaNum <= 5) day = 12;
    else if (fechaNum <= 9) day = 13;
    else if (fechaNum <= 13) day = 14;
    else if (fechaNum <= 17) day = 15;
    else if (fechaNum <= 21) day = 16;
    else if (fechaNum <= 25) day = 17;
    else if (fechaNum <= 29) day = 18;
    else if (fechaNum <= 33) day = 19;
    else if (fechaNum <= 37) day = 20;
    else if (fechaNum <= 41) day = 21;
    else if (fechaNum <= 45) day = 22;
    else if (fechaNum <= 49) day = 23;
    else if (fechaNum <= 53) day = 24;
    else if (fechaNum <= 57) day = 25;
    else if (fechaNum <= 61) day = 26;
    else day = 27;
  } else if (fechaNum <= 88) {
    const calcDay = 28 + Math.floor((fechaNum - 73) / 2.7);
    if (calcDay <= 30) {
      day = calcDay;
    } else {
      month = 6; // July
      day = calcDay - 30;
    }
  } else if (fechaNum <= 96) {
    month = 6; // July
    day = 4 + Math.floor((fechaNum - 89) / 2);
  } else if (fechaNum <= 100) {
    month = 6; // July
    day = fechaNum <= 98 ? 9 : 10;
  } else if (fechaNum === 101) {
    month = 6; // July
    day = 14;
  } else if (fechaNum === 102) {
    month = 6; // July
    day = 15;
  } else if (fechaNum === 103) {
    month = 6; // July
    day = 18;
  } else {
    month = 6; // July
    day = 19;
  }

  const [hourStr, minuteStr] = match.hora.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  return new Date(Date.UTC(2026, month, day, hour, minute));
}

export function isPredictionOpen(match: Match): boolean {
  const matchDate = getMatchDateTimeUTC(match);
  const now = new Date();
  const cutoffTime = matchDate.getTime() - 30 * 60 * 1000;
  return now.getTime() < cutoffTime;
}
