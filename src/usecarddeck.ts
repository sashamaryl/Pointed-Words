import { useCallback, useEffect, useRef, useState } from "react";
import { PointCardType } from "./PointCard";
import { tileDistribution } from "./scrabbleDistribution";

function* idGenerator() {
    let counter = 101;
    while (true) {
        yield counter;
        counter++;
    }
}

export default function useCardDeck() {
    const [gridCards, setGridCards] = useState<PointCardType[]>([]);
    const [handCards, setHandCards] = useState<PointCardType[]>([]);
    const [cardDeck, setCardDeck] = useState<PointCardType[]>([]);
    const [allCards, setAllCards] = useState<PointCardType[]>([]);
    const genId = useRef<Generator<number, void, unknown>>();

    const shuffle = useCallback((deck: PointCardType[]): PointCardType[] => {
        let m = deck.length,
            t,
            i;

        while (m) {
            i = Math.floor(Math.random() * m--);
            t = deck[m];
            deck[m] = deck[i];
            deck[i] = t;
        }

        return deck;
    }, []);

    useEffect(() => {
        genId.current = idGenerator();
    });

    const createCard = (letter?: string, value?: number) => {
        const nextId = genId.current?.next();

        const card: PointCardType = {
            id: nextId?.value as number,
            letter: letter || "",
            value: value || 0,
        };
        return card;
    };

    useEffect(() => {
        if (cardDeck.length !== 0) return;

        const cards = [];

        const { letters } = tileDistribution;
        for (const [key, value] of Object.entries(letters)) {
            const { points, tiles } = value;
            let count = 0;
            while (count < tiles) {
                const card = createCard(key, points);
                cards.push(card);
                count++;
            }
        }

        setAllCards(cards);
        const shuffledcards = shuffle(cards);

        setCardDeck(shuffledcards);
    }, [cardDeck, shuffle]);

    const deal = useCallback(() => {
        const flopCards = cardDeck.slice(0, 9);
        setGridCards(flopCards);
        const hand = cardDeck.slice(9, 12);
        setHandCards(hand);

        setCardDeck(cardDeck.slice(12));
    }, [cardDeck]);

    const clearCards = () => {
        setHandCards([]);
        setGridCards([]);
        setCardDeck([]);
    };

    const drawOne = useCallback((): PointCardType | undefined => {
        if (cardDeck.length === 0) {
            clearCards();
            return;
        }
        const cards = cardDeck;
        const card = cards.splice(0, 1)[0];
        setCardDeck(cards);
        return card;
    }, [cardDeck]);

    const drawNumber = useCallback(
        (num: number) => {
            const cards = cardDeck.slice(0, num);
            const rest = cardDeck.slice(num);
            setCardDeck(rest);
            return cards;
        },
        [cardDeck]
    );

    

    const redealCards = useCallback(
        (usedCards: PointCardType[]) => {
            if (cardDeck.length <= 0) {
                return false
            }

            const usedIds = usedCards.map((card) => card.id);

            const newGrid = gridCards.map((c) => {
                if (usedIds.includes(c.id)) {
                    return drawOne() || createCard("blank", 0);
                } else {
                    return c;
                }
            });

            const newHand = handCards.map((c) => {
                if (usedIds.includes(c.id)) {
                    return drawOne() || createCard("blank", 0);
                } else {
                    return c;
                }
            })

            setGridCards(newGrid);
            setHandCards(newHand);
            
            if (gridCards.length >= 9) return;

            const spots = 9 - gridCards.length;
            const replacementCards = cardDeck.splice(0, spots);
            replacementCards && setGridCards((prevState) => [...prevState, ...replacementCards]);
        
        
            return true
        },
        [cardDeck, drawOne, gridCards, handCards]
    );

    const tradeInHandCard = useCallback(
        (index: number) => {
            const hand: PointCardType[] = handCards;
            const deck: PointCardType[] = cardDeck;
            const replacement = deck.splice(0, 1)[0];
            hand.splice(index, 1, replacement);
            setCardDeck(deck);
            setHandCards(hand);
        },
        [cardDeck, handCards]
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
        clearCards,
        tradeInHandCard,
        redealCards,
        deal,
        shuffle,
        drawOne,
        drawNumber,
        idCardLookup,
        idCardLookupMulti,
    };
}
