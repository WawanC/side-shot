import { useEffect, useMemo, useState } from "react";
import CardItem from "../components/CardItem";
import usePlayer from "../hooks/usePlayer";
import Card from "../interfaces/card";
import {
  isPairCombo,
  isStraightCombo,
  isFullHouse,
  isSameLength,
  compareFullHouse
} from "../utils/check-card";
import socket from "../utils/socket";

interface GameStatus {
  players: {
    id: string;
    username: string;
    cardsCount: number;
  }[];
  turn: string;
  board: Card[];
}

interface Opponent {
  id: string;
  username: string;
  cardsCount: number;
}

const MultiplayerGamePage = () => {
  const player = usePlayer("player");
  const [gameStatus, setGameStatus] = useState<GameStatus>();
  const [username, setUsername] = useState<string>();
  const [opponent, setOpponent] = useState<Opponent>();
  const [canSet, setCanSet] = useState<boolean>(false);

  useEffect(() => {
    socket.emit("get-cards");

    socket.on("cards", (cards: Card[]) => {
      player.setCards(cards.sort((a, b) => a.power - b.power));
    });

    socket.on("game-status", (gameStatus: GameStatus) => {
      console.log(gameStatus);
      const data = gameStatus.players.find((player) => player.id === socket.id);
      const opponentData = gameStatus.players.find(
        (player) => player.id !== socket.id
      );

      if (!data || !opponentData) return;

      if (!username) setUsername(data.username);
      setGameStatus(gameStatus);
      setOpponent({
        id: opponentData.id,
        username: opponentData.username,
        cardsCount: opponentData.cardsCount
      });
    });
  }, []);

  //   Check player cards validity
  useEffect(() => {
    setCanSet(false);
    if (!gameStatus) return;
    const boardCards = gameStatus.board;
    // console.log("Checking player can");
    // Empty Board
    if (
      boardCards.length === 0 &&
      player.selectedCards.length > 0 &&
      (player.selectedCards.length === 1 ||
        isPairCombo(player.selectedCards) ||
        isStraightCombo(player.selectedCards) ||
        isFullHouse(player.selectedCards))
    ) {
      // console.log("Can Zero");
      setCanSet(true);
    }

    if (
      boardCards.length === 1 &&
      player.selectedCards.length === 1 &&
      player.selectedCards[0].power > boardCards[0].power
    ) {
      // console.log("Can Single");
      setCanSet(true);
    }

    if (boardCards.length > 1) {
      // Pair Combo
      if (
        isSameLength(boardCards, player.selectedCards) &&
        isPairCombo(boardCards) &&
        isPairCombo(player.selectedCards) &&
        player.selectedCards[0].power > boardCards[0].power
      ) {
        // console.log("Can Pair");
        setCanSet(true);
      }

      // Straight Combo
      if (
        isSameLength(boardCards, player.selectedCards) &&
        isStraightCombo(boardCards) &&
        isStraightCombo(player.selectedCards) &&
        player.selectedCards[0].power > boardCards[0].power
      ) {
        // console.log("Can Straight");
        setCanSet(true);
      }

      // Full House Combo
      if (
        isFullHouse(boardCards) &&
        isFullHouse(player.selectedCards) &&
        compareFullHouse(player.selectedCards, boardCards)
      ) {
        // console.log("Can Full House");
        setCanSet(true);
      }
    }
  }, [player.selectedCards]);

  // Get turn name
  const turnName = useMemo(() => {
    const player = gameStatus?.players.find(
      (player) => player.id === gameStatus.turn
    );
    if (player) return player.username;
  }, [gameStatus]);

  // Get is player turn now
  const isTurn = useMemo(() => gameStatus?.turn === socket.id, [gameStatus]);

  // Player Set Middle Cards
  const setCards = () => {
    if (player.selectedCards.length <= 0 || !isTurn) return;

    socket.emit("set-board", player.selectedCards);

    player.setCards((cards) =>
      cards.filter((card) => !player.selectedCards.includes(card))
    );
    player.setSelectedCards([]);
  };

  // Player pass
  const passTurn = () => {
    socket.emit("pass-turn");
    // setMiddleCards([]);
    player.setSelectedCards([]);
  };

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

      {/* Board Area */}
      <div className="flex flex-col items-center gap-8">
        <ul className="flex justify-center">
          {gameStatus &&
            gameStatus.board.map((card) => (
              <CardItem
                key={`board-${card.rank}-${card.suit}`}
                className="-m-4 shadow-sm shadow-black"
                card={card}
              />
            ))}
        </ul>
        <span className="text-2xl">{turnName} Turn</span>
      </div>

      {/* Player Area */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-4">
          <button
            className={`bg-pink-500 py-2 px-4 rounded-full font-bold 
          hover:scale-125 transition-all disabled:bg-gray-500 disabled:hover:scale-100`}
            disabled={!isTurn || !canSet}
            onClick={setCards}
          >
            Set
          </button>
          <button
            className={`bg-pink-500 py-2 px-4 rounded-full font-bold 
          hover:scale-125 transition-all disabled:bg-gray-500 disabled:hover:scale-100`}
            disabled={!isTurn}
            onClick={passTurn}
          >
            Pass
          </button>
        </div>
        <ul className="flex justify-center">
          {player.cards.map((card) => (
            <CardItem
              className={`-m-4 shadow-sm shadow-black hover:-translate-y-[25%]
              ${player.selectedCards.includes(card) && "-translate-y-[25%]"}`}
              key={`${card.rank}-${card.suit}`}
              card={card}
              onClick={() => isTurn && player.selectCard(card)}
            />
          ))}
        </ul>
        <span className="text-4xl">{username}</span>
      </div>
    </main>
  );
};

export default MultiplayerGamePage;
