import { useEffect, useMemo, useState } from "react";
import CardItem from "../components/CardItem";
import Card from "../interfaces/card";
import socket from "../utils/socket";

interface GameStatus {
  players: {
    id: string;
    username: string;
    cardsCount: number;
  }[];
}

interface Opponent {
  id: string;
  username: string;
  cardsCount: number;
}

const MultiplayerGamePage = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>();
  const [username, setUsername] = useState<string>();
  const [opponent, setOpponent] = useState<Opponent>();

  useEffect(() => {
    socket.emit("get-cards");

    socket.on("cards", (cards: Card[]) => {
      setCards(cards.sort((a, b) => a.power - b.power));
    });

    socket.on("game-status", (gameStatus: GameStatus) => {
      console.log(gameStatus);
      const data = gameStatus.players.find((player) => player.id === socket.id);
      const opponentData = gameStatus.players.find(
        (player) => player.id !== socket.id
      );

      if (!data || !opponentData) return;

      setUsername(data.username);
      setGameStatus(gameStatus);
      setOpponent({
        id: opponentData.id,
        username: opponentData.username,
        cardsCount: opponentData.cardsCount
      });
    });
  }, []);

  return (
    <main
      className="w-screen h-screen bg-pink-200 
    flex flex-col justify-between items-center p-4"
    >
      {/* Opponent Area */}
      <div className="flex flex-col items-center gap-8">
        <span className="text-4xl">{opponent?.username}</span>
        <ul className="flex justify-center">
          {[...Array(opponent?.cardsCount).keys()].map((card, idx) => (
            <CardItem
              className="-m-4 shadow-sm shadow-black"
              key={`${idx}`}
              folded
              card={{ power: 0, rank: "x", suit: "HEART" }}
            />
          ))}
        </ul>
      </div>

      {/* Player Area */}
      <div className="flex flex-col items-center gap-8">
        <ul className="flex justify-center">
          {cards.map((card) => (
            <CardItem
              className="-m-4 shadow-sm shadow-black hover:-translate-y-[25%]"
              key={`${card.rank}-${card.suit}`}
              card={card}
            />
          ))}
        </ul>
        <span className="text-4xl">{username}</span>
      </div>
    </main>
  );
};

export default MultiplayerGamePage;
