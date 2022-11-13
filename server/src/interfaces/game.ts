import GamePlayer from "./game-player";

export default interface Game {
  players: GamePlayer[];
  turn: string;
}
