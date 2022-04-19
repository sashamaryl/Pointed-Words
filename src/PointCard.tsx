import React, { useCallback, useState } from "react";

export type PointCardType = {
  id: number;
  value: number;
  letter: string;
};

export type PointCardPropsType = {
  pointCard: PointCardType;
  chooseCard: (id: number) => void;
  unChooseCard: (id: number) => void;
  used: boolean;
};

export default function PointCard({
  pointCard,
  chooseCard,
  unChooseCard,
  used,
}: PointCardPropsType) {
  const { id, value, letter } = pointCard;

  const handleClick = useCallback(() => {
    used ? unChooseCard(id) : chooseCard(id);
  }, [chooseCard, id, unChooseCard, used]);

  const bgColor = used ? "bg-primary" : "bg-light";
  const textColor = used ? "text-light" : "text-dark";
  const cardClass = "border border-2 border-medium rounded";

  const cardStyle = {
    height: "auto",
    width: "8em",
  };

  return (
    <div className={`${cardClass} ${bgColor}`} style={cardStyle} onClick={handleClick}>
      <div className={`${textColor} text-start ms-1`}>{value} point</div>
      <div className={`${textColor} fs-1 text-uppercase`}>{letter}</div>
    </div>
  );
}
