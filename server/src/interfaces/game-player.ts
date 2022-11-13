import Card from "./card";

export default interface GamePlayer {
  id: string;
  username: string;
  cards: Card[];
}
