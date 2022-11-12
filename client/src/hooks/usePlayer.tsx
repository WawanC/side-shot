import { useState } from "react";
import Card from "../interfaces/card";

const usePlayer = (name: string) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const selectCard = (selectedCard: Card) => {
    if (selectedCards.includes(selectedCard)) {
      setSelectedCards([]);
      return;
    }
    setSelectedCards((cards) =>
      [...cards, selectedCard].sort((a, b) => a.power - b.power)
    );
  };

  return { name, cards, setCards, selectedCards, selectCard, setSelectedCards };
};

export default usePlayer;
