export const getTurnName = (turn: number) => {
  if (turn === 2) {
    return "Opponent B";
  }
  if (turn === 3) {
    return "Opponent A";
  }
  if (turn === 4) {
    return "Opponent C";
  }
  return "Player";
};
