import Card from "../interfaces/card";

export const getPairCombos = (cards: Card[], boards?: Card[]) => {
  const combinations: Card[][] = [];
  let temp: Card[] = [];

  for (let i = 0; i < cards.length; i++) {
    if (boards && cards[i].power <= boards[0].power) continue;
    if (temp.filter((card) => card.rank === cards[i].rank).length > 0) continue;
    const filteredCards = cards.filter((card) => card.rank === cards[i].rank);
    if (boards && filteredCards.length >= boards.length) {
      let bob: Card[] = [];
      for (let j = 0; j < boards.length; j++) {
        bob.push(filteredCards[j]);
      }
      combinations.push(bob);
      temp.push(cards[i]);
      continue;
    }
    if (filteredCards.length > 1 && !boards) {
      combinations.push(filteredCards);
      temp.push(cards[i]);
    }
  }
  let bestCombos: Card[] = combinations.length > 0 ? combinations[0] : [];
  if (combinations.length > 0) {
    combinations.forEach((combo) => {
      if (combo.length > bestCombos.length) bestCombos = combo;
    });
  }
  return bestCombos;
};

export const getStraightCombo = (cards: Card[], boards?: Card[]) => {
  const combinations: Card[][] = [];
  let temp: Card[] = [];

  for (let i = 0; i < cards.length; i++) {
    if (temp.length < 1) temp = [cards[i]];
    if (boards && temp[0].power <= boards[0].power) {
      temp = [];
      continue;
    }
    if (cards[i].power === temp[temp.length - 1].power + 1) {
      temp.push(cards[i]);
      if (boards && temp.length === boards.length) {
        combinations.push(temp);
        temp = [];
        continue;
      }
    } else {
      if (cards[i].rank === temp[temp.length - 1].rank) {
        continue;
      }
      if (temp.length >= 5) {
        combinations.push(temp);
      }
      temp = [];
    }
    if (temp.length >= 5 && i === cards.length - 1) {
      combinations.push(temp);
      break;
    }
  }

  console.log(combinations);
  let bestCombos: Card[] = combinations.length > 0 ? combinations[0] : [];
  if (combinations.length > 0) {
    combinations.forEach((combo) => {
      if (combo.length > bestCombos.length) bestCombos = combo;
    });
  }
  console.log(bestCombos);
  return bestCombos;
};

export const getFullHouseCombo = (cards: Card[], boards?: Card[]) => {
  // Get the board's three and two if exists
  let boardThree: Card | null = null;
  let boardTwo: Card | null = null;
  if (boards) {
    if (boards.filter((c) => c.rank === boards[0].rank).length === 3) {
      boardThree = boards[0];
      boardTwo = boards[boards.length - 1];
    } else {
      boardThree = boards[boards.length - 1];
      boardTwo = boards[0];
    }
  }

  if (boards && (!boardThree || !boardTwo)) return [];

  // Find cards with 3 occurences
  let threeCard: Card | null = null;
  for (let i = 0; i < cards.length; i++) {
    if (boards && boardThree && cards[i].power <= boardThree.power) continue;
    const card = cards[i];
    const count = cards.filter((c) => c.rank === card.rank).length;
    if (count >= 3) {
      threeCard = card;
      break;
    }
  }

  // Find cards with 2 occurences that not the first card
  if (!threeCard) return [];
  let twoCard: Card | null = null;
  for (let i = 0; i < cards.length; i++) {
    if (boards && boardTwo && cards[i].power <= boardTwo.power) continue;
    const card = cards[i];
    if (card.rank === threeCard.rank) {
      continue;
    }
    const count = cards.filter((c) => c.rank === card.rank).length;
    if (count >= 2) {
      twoCard = card;
      break;
    }
  }

  // Get the three's and two's to single array
  if (!threeCard || !twoCard) return [];
  const threeCards = cards.filter((c) => c.rank === threeCard?.rank);
  const twoCards = cards.filter((c) => c.rank === twoCard?.rank);
  let combinations: Card[] = [];
  for (let i = 0; i < 3; i++) {
    const temp = threeCards.pop();
    if (temp) combinations.push(temp);
  }
  for (let i = 0; i < 2; i++) {
    const temp = twoCards.pop();
    if (temp) combinations.push(temp);
  }

  // Return the combinations result if exists
  if (combinations.length === 5) {
    return combinations;
  } else {
    return [];
  }
};

export const getSingleCard = (cards: Card[], boards?: Card[]) => {
  if (boards) {
    const selectedCard = cards.find((c) => c.power > boards[0].power);
    if (selectedCard) {
      return [selectedCard];
    } else {
      return [];
    }
  }
  return [cards[0]];
};
