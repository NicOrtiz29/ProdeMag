export function calculateMatchPoints(prediction: [number, number], realResult: [number, number]): number {
  if (!prediction || !realResult) return 0;
  
  const [pLocal, pVis] = prediction;
  const [rLocal, rVis] = realResult;

  if (pLocal === rLocal && pVis === rVis) {
    return 3;
  }

  // Ganador local
  if (pLocal > pVis && rLocal > rVis) return 1;
  // Ganador visitante
  if (pLocal < pVis && rLocal < rVis) return 1;
  // Empate
  if (pLocal === pVis && rLocal === rVis) return 1;

  return 0;
}
