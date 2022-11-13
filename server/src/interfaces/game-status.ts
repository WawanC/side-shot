export default interface GameStatus {
  players: {
    id: string;
    username: string;
    cardsCount: number;
  }[];
  turn: string;
}
