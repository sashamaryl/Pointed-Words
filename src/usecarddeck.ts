import { useCallback, useEffect, useMemo, useState } from "react";
import { PointCardType } from "./PointCard";
import { tileDistribution } from "./scrabbleDistribution";

export default function useCardDeck() {
    const [gridCards, setGridCards] = useState<PointCardType[]>([]);
    const [handCards, setHandCards] = useState<PointCardType[]>([]);
    const [cardDeck, setCardDeck] = useState<PointCardType[]>([]);
    const [allCards, setAllCards] = useState<PointCardType[]>([]);

    function* idGenerator() {
        let counter = 101;
        while (true) {
            yield counter;
            counter++;
        }
    }

    const shuffle = useCallback((deck: PointCardType[]): PointCardType[] => {
        let m = deck.length,
            t,
            i;

        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = deck[m];
            deck[m] = deck[i];
            deck[i] = t;
        }

        return deck;
    }, []);

    const makeNewDeck = () => {};

    useEffect(() => {
        if (cardDeck.length !== 0) return;

        const cards = [];

        const { letters } = tileDistribution;
        const genId = idGenerator();
        for (const [key, value] of Object.entries(letters)) {
            const { points, tiles } = value;
            let count = 0;
            while (count < tiles) {
                const nextId = genId.next();
                if (nextId.done) break;
                const card: PointCardType = {
                    id: nextId.value as number,
                    letter: key,
                    value: points,
                };
                cards.push(card);
                count++;
            }
        }

        setAllCards(cards)
        const shuffledcards = shuffle(cards);

        setCardDeck(shuffledcards);
    }, [cardDeck, shuffle]);

    const deal = useCallback(() => {
        console.log(cardDeck);
        const flopCards = cardDeck.slice(0, 9);
        setGridCards(flopCards);
        const hand = cardDeck.slice(9, 12);
        setHandCards(hand);

        console.log(flopCards, hand);
        setCardDeck(cardDeck.slice(12));
    }, [cardDeck]);

    function drawOne(): PointCardType | undefined {
        if (cardDeck.length === 0) return;
        const cards = cardDeck;
        const card = cards[0];
        setCardDeck(cards.slice(1));
        return card;
    }

    function drawNumber(num: number) {
        const cards = [];
        while (cards.length < num) {
            cards.push(drawOne());
        }
        return cards;
    }

    const removeCard = useCallback(
        (card: PointCardType) => {
            setGridCards(gridCards.filter((t) => t.id !== card.id));
            setHandCards(handCards.filter((t) => t.id !== card.id));
        },
        [handCards, gridCards]
    );

    const idCardLookup = useCallback(
        (id: number) => {
            const card = allCards && allCards.find((card) => card.id === id);
            return card;
        },
        [allCards]
    );

    function idCardLookupMulti(ids: number[]) {
        return ids.map((id) => idCardLookup(id));
    }

    return {
        allCards,
        cardDeck,
        gridCards,
        handCards,
        deal,
        shuffle,
        drawOne,
        drawNumber,
        removeCard,
        idCardLookup,
        idCardLookupMulti,
        makeNewDeck,
    };
}
