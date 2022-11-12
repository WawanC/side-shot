import { FC, useMemo } from "react";
import Card from "../interfaces/card";
import getSuitSymbol from "../utils/get-suit-symbol";

interface CardProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  folded?: boolean;
}

const CardItem: FC<CardProps> = (props) => {
  const cardSymbol = useMemo(() => getSuitSymbol(props.card), []);

  const isRedSymbol = useMemo(
    () => props.card.suit === "DIAMOND" || props.card.suit === "HEART",
    []
  );

  return (
    <article
      className={`h-28 w-24 p-8 text-4xl rounded-xl hover:cursor-pointer font-bold
      transition-all relative flex justify-center items-center ${
        isRedSymbol ? "text-red-500" : "text-black"
      }  ${props.className} ${props.folded ? "bg-pink-500" : "bg-white"}`}
      onClick={props.onClick}
    >
      {!props.folded && (
        <>
          <span className="absolute top-1 left-2 text-xl">
            {props.card.rank}
          </span>
          <span dangerouslySetInnerHTML={{ __html: cardSymbol }}></span>
        </>
      )}
    </article>
  );
};

export default CardItem;
