import { useCallback, useEffect, useState } from "react";
import CardItem from "./components/CardItem";
import useOpponent from "./hooks/useOpponent";
import usePlayer from "./hooks/usePlayer";
import Card from "./interfaces/card";
import GameState from "./interfaces/game-state";
import cardsData from "./utils/card-data";
import {
  compareFullHouse,
  isFullHouse,
  isPairCombo,
  isSameLength,
  isStraightCombo
} from "./utils/check-card";
import { getTurnName } from "./utils/get-turn";
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
  const player = usePlayer("Player");

  const opponentA = useOpponent("Opponent A");
  const opponentB = useOpponent("Opponent B");
  const opponentC = useOpponent("Opponent C");

  const [middleCards, setMiddleCards] = useState<Card[]>([]);
  const [turn, setTurn] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>();
  const [canSet, setCanSet] = useState<boolean>(false);
  const [contestCount, setContestCount] = useState<number>(0);
  const [contestHolder, setContestHolder] = useState<number | null>(null);

  const nextTurn = () => {
    if (turn === 4) {
      setTurn(1);
    } else {
      setTurn((turn) => turn + 1);
    }
  };

  // StartGame Method
  const startGame = useCallback(() => {
    // Shuffle and distribute cards
    const shuffledCards = shuffleCards(cardsData);

    const playerCardsTemp: Card[] = [];
    const opponentACardsTemp: Card[] = [];
    const opponentBCardsTemp: Card[] = [];
    const opponentCCardsTemp: Card[] = [];

    let cardsLength = 13;

    for (let index = 0; index < cardsLength; index++) {
      const card = shuffledCards.pop();
      if (card) playerCardsTemp.push(card);
    }

    for (let index = 0; index < cardsLength; index++) {
      const card = shuffledCards.pop();
      if (card) opponentACardsTemp.push(card);
    }

    for (let index = 0; index < cardsLength; index++) {
      const card = shuffledCards.pop();
      if (card) opponentBCardsTemp.push(card);
    }

    for (let index = 0; index < cardsLength; index++) {
      const card = shuffledCards.pop();
      if (card) opponentCCardsTemp.push(card);
    }

    player.setCards(playerCardsTemp.sort((a, b) => a.power - b.power));
    // player.setCards(opponentCardsRigged);
    opponentA.setCards(opponentACardsTemp.sort((a, b) => a.power - b.power));
    opponentB.setCards(opponentBCardsTemp.sort((a, b) => a.power - b.power));
    opponentC.setCards(opponentCCardsTemp.sort((a, b) => a.power - b.power));
    // opponent.setCards(playerCardsRigged);
    setMiddleCards([]);
    setTurn(1);
    setGameState("PLAYING");
    setContestCount(0);
    setContestHolder(1);
    // Shuffle and distribute cards
  }, []);
  // StartGame Method

  // Player Set Middle Cards
  const setCards = () => {
    if (player.selectedCards.length <= 0 || turn !== 1) return;

    player.setCards((cards) =>
      cards.filter((card) => !player.selectedCards.includes(card))
    );

    setMiddleCards(player.selectedCards);
    setContestHolder(1);
    setContestCount(0);
    player.setSelectedCards([]);
    nextTurn();
  };
  // Player Set Middle Cards

  const passTurn = () => {
    // setMiddleCards([]);
    player.setSelectedCards([]);
    setContestCount((count) => count + 1);
    nextTurn();
  };

  // Game Start Setup
  useEffect(() => {
    startGame();
  }, []);
  // Game Start Setup

  // Opponent Move
  useEffect(() => {
    const opponentMoving = async () => {
      // console.log("Turn :", turn);
      // console.log("MiddleCards :", middleCards);
      if (gameState !== "PLAYING" || turn === 1) return;
      let selectedCards: Card[] = [];
      const boardsCards = contestCount >= 3 ? [] : middleCards;

      if (turn === 2) {
        selectedCards = await opponentB.move(boardsCards);
      }
      if (turn === 3) {
        selectedCards = await opponentA.move(boardsCards);
      }
      if (turn === 4) {
        selectedCards = await opponentC.move(boardsCards);
      }

      if (selectedCards.length === 0) {
        setContestCount((count) => count + 1);
      } else {
        setContestHolder(turn);
        setContestCount(0);
        setMiddleCards(selectedCards);
      }

      nextTurn();
    };
    opponentMoving();
  }, [turn]);
  // Opponent Move

  // Check Contest
  useEffect(() => {
    // console.log(contestCount);
    if (contestHolder && contestCount >= 3) {
      setMiddleCards([]);
      setContestCount(0);
      setTurn(contestHolder);
    }
  }, [contestCount]);
  // Check Contest

  // Check Game State
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    if (player.cards.length === 0) {
      setGameState("PLAYER_WIN");
    }
    if (opponentA.cards.length === 0) {
      setGameState("OPPONENT_WIN");
    }
  }, [player.cards.length, opponentA.cards.length]);

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
        className="flex flex-col h-[50vh] justify-center items-center 
      bg-blue-200 flex-1 w-full relative"
      >
        {/* Opponent A Side */}
        <div className="flex flex-col absolute top-4 gap-4 items-center">
          <p className="text-xl font-bold">Opponent A</p>
          <div className="flex justify-center">
            {opponentA.cards.map((card) => (
              <CardItem
                card={card}
                key={`${card.rank}-${card.suit}`}
                className={`-m-4 shadow-sm shadow-black`}
                folded={gameState !== "PLAYER_WIN"}
              />
            ))}
          </div>
        </div>
        {/* Opponent A Side */}

        {/* Opponent B Side */}
        <div
          className="flex flex-col gap-8 items-center
          absolute top-1/2 -translate-y-1/2 left-0 -rotate-90 w-[300px]"
        >
          <p className="font-bold text-xl">Opponent B</p>
          <div className="flex justify-center">
            {opponentB.cards.map((card) => (
              <CardItem
                card={card}
                key={`${card.rank}-${card.suit}`}
                className={`-m-8 shadow-sm shadow-black`}
                folded={gameState !== "PLAYER_WIN"}
              />
            ))}
          </div>
        </div>
        {/* Opponent B Side */}

        {/* Opponent C Side */}
        <div
          className="flex flex-col gap-8 items-center
        absolute top-1/2 -translate-y-1/2 right-0 rotate-90 w-[300px]"
        >
          <p className="text-xl font-bold">Opponent C</p>
          <div className="flex justify-center">
            {opponentC.cards.map((card) => (
              <CardItem
                card={card}
                key={`${card.rank}-${card.suit}`}
                className={`-m-8 shadow-sm shadow-black`}
                folded={gameState !== "PLAYER_WIN"}
              />
            ))}
          </div>
        </div>
        {/* Opponent C Side */}

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
        <div className="flex flex-col items-center gap-12 absolute bottom-8">
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
              disabled={turn !== 1}
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
                onClick={() => turn === 1 && player.selectCard(card)}
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
          <span>{getTurnName(turn)} TURN</span>
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
