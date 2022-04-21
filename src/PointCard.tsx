import React, { useCallback } from "react";
import Fade from "react-bootstrap/esm/Fade";

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
    shouldFade = true,
}: PointCardPropsType & { shouldFade?: boolean }) {
    const { id, value, letter } = pointCard;

    const handleClick = useCallback(() => {
        used ? unChooseCard(id) : chooseCard(id);
    }, [chooseCard, id, unChooseCard, used]);

    const bgColor = used ? "bg-grey" : "bg-light";
    const textColor = used ? "text-light" : "text-dark";
    const cardClass = "border border-2 border-medium rounded";

    const cardStyle = {
        height: "auto",
        width: "8em",
    };

    return (
        <Fade in={shouldFade} appear>
            <div className={`${cardClass} ${bgColor}`} style={cardStyle} onClick={handleClick}>
                <div className={`${textColor} text-start ms-1`}>{value} point</div>
                <div className={`${textColor} fs-1 text-uppercase`}>{letter}</div>
            </div>
        </Fade>
    );
}
