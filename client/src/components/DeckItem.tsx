import { FC } from "react";

const DeckItem: FC<{ className?: string }> = (props) => {
  return (
    <article
      className={`h-28 w-24 p-8 text-4xl rounded-xl hover:cursor-pointer font-bold
        hover:scale-125 transition-all bg-pink-400 ${props.className}`}
    />
  );
};

export default DeckItem;
