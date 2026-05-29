export function calculateMatchPoints(prediction: [number, number], realResult: [number, number]): number {
  if (!prediction || !realResult) return 0;
  
  const [pLocal, pVis] = prediction;
  const [rLocal, rVis] = realResult;

  let points = 0;

  // 1. Tendency: 3 points for correct winner or draw
  const pWinner = pLocal > pVis ? 'local' : pLocal < pVis ? 'visitor' : 'draw';
  const rWinner = rLocal > rVis ? 'local' : rLocal < rVis ? 'visitor' : 'draw';

  if (pWinner === rWinner) {
    points += 3;
  }

  // 2. Local goals: 1 point for exact local goals
  if (pLocal === rLocal) {
    points += 1;
  }

  // 3. Visitor goals: 1 point for exact visitor goals
  if (pVis === rVis) {
    points += 1;
  }

  return points;
}
