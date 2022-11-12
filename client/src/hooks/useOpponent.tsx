import { useState } from "react";
import Card from "../interfaces/card";
import { isFullHouse, isPairCombo, isStraightCombo } from "../utils/check-card";
import {
  getPairCombos,
  getStraightCombo,
  getFullHouseCombo,
  getSingleCard
} from "../utils/opponent-ai";

const useOpponent = (name: string) => {
  const [cards, setCards] = useState<Card[]>([]);

  // Opponent AI Move
  const move = (middleCards: Card[]) => {
    return new Promise<Card[]>((resolve) => {
      setTimeout(() => {
        const opponentCards = cards.sort((a, b) => a.power - b.power);
        let opponentSelectedCards: Card[] = [];

        // Empty board
        if (middleCards.length === 0) {
          const pairCombos = getPairCombos(opponentCards);
          const straightCombos = getStraightCombo(opponentCards);
          const fullHouseCombos = getFullHouseCombo(opponentCards);

          if (pairCombos.length > straightCombos.length) {
            if (pairCombos.length > fullHouseCombos.length) {
              opponentSelectedCards = pairCombos;
            } else {
              opponentSelectedCards = fullHouseCombos;
            }
          } else {
            opponentSelectedCards = straightCombos;
          }

          if (opponentSelectedCards.length === 0) {
            opponentSelectedCards = getSingleCard(cards);
          }
        }

        // There already board card
        if (middleCards.length > 0) {
          if (middleCards.length === 1) {
            opponentSelectedCards = getSingleCard(cards, middleCards);
          }

          if (isPairCombo(middleCards)) {
            opponentSelectedCards = getPairCombos(opponentCards, middleCards);
          }
          if (isStraightCombo(middleCards)) {
            opponentSelectedCards = getStraightCombo(
              opponentCards,
              middleCards
            );
          }
          if (isFullHouse(middleCards)) {
            opponentSelectedCards = getFullHouseCombo(
              opponentCards,
              middleCards
            );
          }
        }

        // Remove cards from hand
        let temp = [...cards];
        opponentSelectedCards.forEach((card) => {
          temp = temp.filter(
            (c) => c.rank !== card.rank || c.suit !== card.suit
          );
        });
        setCards(temp);
        resolve(opponentSelectedCards);
      }, 2000);
    });
  };

  return { name, cards, setCards, move };
};

export default useOpponent;
