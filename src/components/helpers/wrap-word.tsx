import React from "react";

type WrapWordProps = {
  text: string;
  wordToWrap: string;
  wrapperClassName?: string;
};

const WrapWord: React.FC<WrapWordProps> = ({
  text,
  wordToWrap,
  wrapperClassName,
}) => {
  const parts = text.split(new RegExp(`(${wordToWrap})`, "i"));
  return (
    <p>
      {parts.map((part, index) =>
        part.toLowerCase() === wordToWrap.toLowerCase() ? (
          <span key={index} className={wrapperClassName}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </p>
  );
};

export default WrapWord;
