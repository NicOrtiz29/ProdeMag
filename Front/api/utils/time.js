// api/utils/time.js
const { DateTime } = require('luxon');
// Asumiendo que el objeto match tiene los campos `fecha` (día del torneo) y `hora` (HH:mm) en UTC
function isPredictionAllowed(match) {
  // Build a DateTime for match start in the assumed timezone (America/Argentina/Buenos_Aires)
  // Construir la fecha y hora del partido en UTC
  const matchDateTime = DateTime.fromObject({
    month: 6, // TODO: extraer el mes real del calendario si es necesario
    day: match.fecha,
    hour: parseInt(match.hora.split(':')[0]),
    minute: parseInt(match.hora.split(':')[1]),
  }, { zone: 'utc' });

  // Current time in same zone
  // Hora actual en UTC
  const now = DateTime.utc();
  // Allow predictions if now is at least 45 minutes before match start
  return now <= matchDateTime.minus({ minutes: 45 });
}

module.exports = { isPredictionAllowed };
