import { useCallback, useEffect, useState } from "react";
import CardItem from "./components/CardItem";
import useOpponent from "./hooks/useOpponent";
import usePlayer from "./hooks/usePlayer";
import Card from "./interfaces/card";
import GameState from "./interfaces/game-state";
import Turn from "./interfaces/turn";
import cardsData from "./utils/card-data";
import {
  compareFullHouse,
  isFullHouse,
  isPairCombo,
  isSameLength,
  isStraightCombo
} from "./utils/check-card";
import shuffleCards from "./utils/shuffle-card";

const getStatusText = (state: "PLAYER_WIN" | "OPPONENT_WIN") => {
  if (state === "PLAYER_WIN") return "You win !";
  if (state === "OPPONENT_WIN") return "You lose";
  return false;
};

// const playerCardsRigged: Card[] = [
//   { rank: "10", suit: "CLUB", power: 8 },
//   { rank: "10", suit: "DIAMOND", power: 8 },
//   { rank: "10", suit: "SPADE", power: 8 },
//   { rank: "2", suit: "SPADE", power: 13 },
//   { rank: "2", suit: "CLUB", power: 13 },
//   { rank: "2", suit: "HEART", power: 13 },
//   { rank: "A", suit: "HEART", power: 12 }
// ];

// const opponentCardsRigged: Card[] = [
//   { rank: "3", suit: "CLUB", power: 1 },
//   { rank: "3", suit: "DIAMOND", power: 1 },
//   { rank: "3", suit: "HEART", power: 1 },
//   { rank: "J", suit: "SPADE", power: 9 },
//   { rank: "J", suit: "CLUB", power: 9 },
//   { rank: "J", suit: "DIAMOND", power: 9 },
//   { rank: "8", suit: "CLUB", power: 6 }
// ];

const App = () => {
  const player = usePlayer();
  const opponent = useOpponent();
  const [middleCards, setMiddleCards] = useState<Card[]>([]);
  const [turn, setTurn] = useState<Turn>();
  const [gameState, setGameState] = useState<GameState>();
  const [canSet, setCanSet] = useState<boolean>(false);

  // StartGame Method
  const startGame = useCallback(() => {
    // Shuffle and distribute cards
    const shuffledCards = shuffleCards(cardsData);

    const playerCardsTemp: Card[] = [];
    const opponentCardsTemp: Card[] = [];

    let cardsLength = 13;

    for (let index = 0; index < cardsLength; index++) {
      const card = shuffledCards.pop();
      if (card) playerCardsTemp.push(card);
    }

    for (let index = 0; index < cardsLength; index++) {
      const card = shuffledCards.pop();
      if (card) opponentCardsTemp.push(card);
    }

    player.setCards(playerCardsTemp.sort((a, b) => a.power - b.power));
    // player.setCards(opponentCardsRigged);
    opponent.setCards(opponentCardsTemp.sort((a, b) => a.power - b.power));
    // opponent.setCards(playerCardsRigged);
    setMiddleCards([]);
    setTurn("PLAYER");
    setGameState("PLAYING");
    // Shuffle and distribute cards
  }, []);
  // StartGame Method

  // Set Middle Cards
  const setCards = () => {
    if (player.selectedCards.length <= 0) return;

    player.setCards((cards) =>
      cards.filter((card) => !player.selectedCards.includes(card))
    );

    setMiddleCards(player.selectedCards);
    player.setSelectedCards([]);
    setTurn("OPPONENT");
  };
  // Set Middle Cards

  const passTurn = () => {
    setMiddleCards([]);
    player.setSelectedCards([]);
    setTurn("OPPONENT");
  };

  // Game Start Setup
  useEffect(() => {
    startGame();
  }, []);
  // Game Start Setup

  // Opponent Move
  useEffect(() => {
    if (turn === "OPPONENT" && gameState === "PLAYING") {
      opponent.move(middleCards).then((cards) => {
        setMiddleCards(cards);
        setTurn("PLAYER");
      });
    }
  }, [turn]);
  // Opponent Move

  // Check Game State
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    if (player.cards.length === 0) {
      setGameState("PLAYER_WIN");
    }
    if (opponent.cards.length === 0) {
      setGameState("OPPONENT_WIN");
    }
  }, [player.cards.length, opponent.cards.length]);

  // Check if player card is valid
  useEffect(() => {
    setCanSet(false);
    // console.log("Checking player can");
    // Empty Board
    if (
      middleCards.length === 0 &&
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
      middleCards.length === 1 &&
      player.selectedCards.length === 1 &&
      player.selectedCards[0].power > middleCards[0].power
    ) {
      // console.log("Can Single");
      setCanSet(true);
    }

    if (middleCards.length > 1) {
      // Pair Combo
      if (
        isSameLength(middleCards, player.selectedCards) &&
        isPairCombo(middleCards) &&
        isPairCombo(player.selectedCards) &&
        player.selectedCards[0].power > middleCards[0].power
      ) {
        // console.log("Can Pair");
        setCanSet(true);
      }

      // Straight Combo
      if (
        isSameLength(middleCards, player.selectedCards) &&
        isStraightCombo(middleCards) &&
        isStraightCombo(player.selectedCards) &&
        player.selectedCards[0].power > middleCards[0].power
      ) {
        // console.log("Can Straight");
        setCanSet(true);
      }

      // Full House Combo
      if (
        isFullHouse(middleCards) &&
        isFullHouse(player.selectedCards) &&
        compareFullHouse(player.selectedCards, middleCards)
      ) {
        // console.log("Can Full House");
        setCanSet(true);
      }
    }
  }, [player.selectedCards]);

  return (
    <main className="flex flex-col items-center h-screen">
      <h1 className="text-4xl font-bold bg-pink-500 w-full p-4 text-center">
        Side-Shot
      </h1>
      <section
        className="flex flex-col h-[50vh] justify-between items-center 
      bg-pink-200 flex-1 w-full py-8"
      >
        {/* Opponent Side */}
        <div className="flex justify-center">
          {opponent.cards.map((card) => (
            <CardItem
              card={card}
              key={`${card.rank}-${card.suit}`}
              className={`-m-4 shadow-sm shadow-black`}
              folded={gameState !== "PLAYER_WIN"}
            />
          ))}
        </div>
        {/* Opponent Side */}

        {/* Middle Side */}
        <div className="relative flex justify-center w-1/2 h-28 items-center">
          {gameState === "PLAYING" ? (
            middleCards.length > 0 &&
            middleCards.map((card) => (
              <CardItem
                card={card}
                key={`${card.rank}-${card.suit}`}
                className={`-m-4 shadow-sm shadow-black`}
              />
            ))
          ) : (
            <span className="text-4xl font-bold">
              {gameState && getStatusText(gameState)}
            </span>
          )}
        </div>
        {/* Middle Side */}

        {/* Player Side */}
        <div className="flex flex-col items-center gap-12">
          <div className="flex gap-4">
            <button
              className={`bg-pink-500 py-2 px-4 rounded-full font-bold 
          hover:scale-125 transition-all disabled:bg-gray-500 disabled:hover:scale-100`}
              disabled={!canSet}
              onClick={setCards}
            >
              Set
            </button>
            <button
              className={`bg-pink-500 py-2 px-4 rounded-full font-bold 
          hover:scale-125 transition-all disabled:bg-gray-500 disabled:hover:scale-100`}
              disabled={turn === "OPPONENT"}
              onClick={passTurn}
            >
              Pass
            </button>
          </div>
          <div className="flex justify-center">
            {player.cards.map((card, idx) => (
              <CardItem
                className={`-m-4 shadow-sm shadow-black hover:-translate-y-[25%] ${
                  player.selectedCards.includes(card) && "-translate-y-[25%]"
                }`}
                card={card}
                key={`${card.rank}-${card.suit}`}
                onClick={() => turn === "PLAYER" && player.selectCard(card)}
              />
            ))}
          </div>
        </div>
        {/* Player Side */}
      </section>
      <div
        className="bg-pink-100 w-full text-center p-4 text-xl font-bold 
      flex flex-col items-center"
      >
        {gameState === "PLAYING" ? (
          <span>{turn} TURN</span>
        ) : (
          <button
            className="bg-pink-500 w-fit py-2 px-6 rounded-full hover:scale-125 transition-all"
            onClick={startGame}
          >
            Play Again
          </button>
        )}
      </div>
    </main>
  );
};

export default App;
