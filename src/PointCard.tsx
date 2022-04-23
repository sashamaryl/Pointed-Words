import { relative } from "path";
import React, { useCallback, useEffect, useState } from "react";
import { Fade } from "react-bootstrap";
import { Transition } from "react-transition-group";

export type PointCardType = {
    id: number;
    value: number;
    letter: string;
};

export type CardStateType =
    | "entering"
    | "unselected"
    | "selected"
    | "canTrade"
    | "discarded"
    | "exiting";

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

    const [cardState, setCardState] = useState<CardStateType>("entering");

    const handleClick = useCallback(() => {
        if (used) {
            unChooseCard(id);
            setCardState("unselected");
        } else {
            chooseCard(id);
            setCardState("selected");
        }
    }, [chooseCard, id, unChooseCard, used]);

    useEffect(() => {
        cardState === "entering" && setCardState("unselected");
    }, [cardState]);

    const cardStyle = {
        transition: "linear 500ms",
    };

    const cardStateClasses: { [cardState: string]: string } = {
        entering: "opacity-0 bg-light",
        unselected: "opacity-100 bg-light",
        selected: "bg-light opacity-25 text-muted",
        canTrade: "bg-secondary",
        discarded: "opacity-25",
        exiting: "opacity-0",
    };

    return (
        <div className={` ${cardStateClasses[cardState]} `} style={cardStyle} onClick={handleClick}>
            <div className={`text-start fs-6 ms-1`}>
                {value} point{value === 1 ? "" : "s"}
            </div>
            <div className={`fs-1 text-uppercase`}>{letter}</div>
        </div>
    );
}
