import Card from "./card";
import GamePlayer from "./game-player";

export default interface Game {
  players: GamePlayer[];
  turn: string;
  board: Card[];
}
