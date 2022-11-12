import Card from "../interfaces/card";

export const isSameLength = (cardsA: Card[], cardsB: Card[]) =>
  cardsA.length === cardsB.length;

export const isPairCombo = (cards: Card[]) => {
  if (cards.length < 2) return false;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].rank !== cards[0].rank) return false;
  }
  return true;
};

export const isStraightCombo = (cards: Card[]) => {
  if (cards.length < 5) return false;
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].power !== cards[i + 1].power - 1) {
      return false;
    }
  }
  return true;
};

export const isFullHouse = (cards: Card[]) => {
  if (cards.length !== 5) return false;
  let temp: Card;
  if (
    cards.filter((card) => {
      if (card.rank !== cards[0].rank) {
        if (temp && temp.rank === card.rank) {
          return false;
        }
        temp = card;
        return true;
      }
      return false;
    }).length !== 1
  ) {
    return false;
  }
  return true;
};

export const compareFullHouse = (cardsA: Card[], cardsB: Card[]) => {
  const firstA = cardsA[0];
  const secondA = cardsA[cardsA.length - 1];
  const firstB = cardsB[0];
  const secondB = cardsB[cardsB.length - 1];

  const firstACount = cardsA.filter((card) => card.rank === firstA.rank).length;
  const secondACount = cardsA.filter(
    (card) => card.rank === secondA.rank
  ).length;
  const firstBCount = cardsA.filter((card) => card.rank === firstB.rank).length;
  const secondBCount = cardsA.filter(
    (card) => card.rank === secondB.rank
  ).length;

  let threeA = firstACount > secondACount ? firstA : secondA;
  let twoA = firstACount < secondACount ? firstA : secondA;

  let threeB = firstBCount > secondBCount ? firstB : secondB;
  let twoB = firstBCount < secondBCount ? firstB : secondB;

  return threeA.power > threeB.power && twoA.power > twoB.power;
};
