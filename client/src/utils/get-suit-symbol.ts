import Card from "../interfaces/card";

const getSuitSymbol = (card: Card) => {
  switch (card.suit) {
    case "CLUB":
      return "&clubs;";

    case "DIAMOND":
      return "&diams;";

    case "HEART":
      return "&hearts;";

    case "SPADE":
      return "&spades;";

    default:
      return "*";
  }
};

export default getSuitSymbol;
