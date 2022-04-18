import React, { useCallback, useState } from "react";
import Card from "react-bootstrap/Card";

export type PointCardType = {
  id: number;
  value: number;
  letter: string;
};

export type PointCardPropsType = {
  pointCard: PointCardType;
  chooseCard: (pointCard: PointCardType) => void;
  unChooseCard: (id: number) => void;
};

export default function PointCard({ pointCard, chooseCard, unChooseCard }: PointCardPropsType) {
  const { id, value, letter } = pointCard;

  const [selected, setSelected] = useState(false);

  const handleClick = useCallback(() => {
    if (selected) {
      setSelected(false);
      unChooseCard(id);
    } else {
      setSelected(true);
      chooseCard(pointCard);
    }
  }, [chooseCard, id, pointCard, selected, unChooseCard]);

  const bgColor = selected ? "bg-primary" : "bg-light";
  const textColor = selected ? "text-light" : "text-dark";
  const cardClass = "border border-2 border-medium";

  const cardStyle = {
    height: "auto",
    width: "8em",
  };

  return (
      <Card className={`${cardClass} ${bgColor}`} style={cardStyle} onClick={handleClick}>
        <Card.Header className='text-start text-muted text'>
          <div className={`${textColor} text-start`}>{value} point</div>
        </Card.Header>
        <Card.Body>
          <Card.Title className={`${textColor} fs-1 text-uppercase`}>{letter}</Card.Title>
        </Card.Body>
      </Card>
  );
}
