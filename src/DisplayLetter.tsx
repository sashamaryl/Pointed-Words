import { PointCardType } from "./PointCard";

export default function DisplayLetter({ card }: { card: PointCardType }) {
    return <div className='fs-1 text-light text-uppercase'>{card.letter}</div>;
}

export function WordDisplay({ usedCards }: { usedCards: PointCardType[] }) {
    return (
        <>
            {usedCards.map((card) => (
                <DisplayLetter key={`${card.id}`} card={card} />
            ))}
        </>
    );
}
