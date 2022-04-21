import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import "./App.css";
import "./custom.scss";
import PointCard, { PointCardType } from "./PointCard";
import isValidWord from "./dictionary";
import useCardDeck from "./usecarddeck";

function App() {
    const {
        allCards,
        cardDeck,
        gridCards,
        handCards,
        deal,
        drawOne,
        drawNumber,
        idCardLookup,
        idCardLookupMulti,
        makeNewDeck,
    } = useCardDeck();

    const gridAreas: { [id: number]: number[] } = {
        0: [3, 3],
        1: [3, 1],
        2: [3, 2],
        3: [1, 3],
        4: [1, 1],
        5: [1, 2],
        6: [2, 3],
        7: [2, 1],
        8: [2, 2],
    };

    const [usedCardIds, setUsedCardIds] = useState<number[]>([]);
    const [usedCards, setUsedCards] = useState<PointCardType[]>([]);
    const [pointTotal, setPointTotal] = useState(0);
    const [score, setScore] = useState(0);
    const [shouldAcceptWord, setShouldAcceptWord] = useState<boolean | undefined>(undefined);
    const [willAcceptWord, setWillAcceptWord] = useState<boolean | undefined>(undefined);

    const wait = useCallback((miliseconds: number = 2000): Promise<boolean> => {
        return new Promise((resolve) =>
            setTimeout(() => {
                resolve(true);
                console.log("resolved");
            }, miliseconds)
        );
    }, []);

    const addToScore = useCallback(
        (newScore: number) => {
            const prevScore = score;
            setScore(newScore + prevScore);
        },
        [score]
    );

    useEffect(() => {
        if (usedCardIds.length <= 0) return;

        const cards = idCardLookupMulti(usedCardIds);

        const points = cards.map((card) => card?.value ?? 0).reduce((a, b) => a + b);

        points && setPointTotal(points);
    }, [idCardLookupMulti, usedCardIds, usedCards]);

    const chooseCard = (cardId: number) => {
        const card = allCards.find((card) => card.id === cardId);
        card && setUsedCards([...usedCards, card]);
        setUsedCardIds([...usedCardIds, cardId]);
        setShouldAcceptWord(undefined);
    };

    const unChooseCard = (id: number) => {
        const filteredCards = usedCards.filter((card) => card.id !== id);
        setUsedCards(filteredCards);
        const filteredIds = usedCardIds.filter((usedId) => usedId !== id);
        setUsedCardIds(filteredIds);
        setShouldAcceptWord(undefined);
    };

    const reset = useCallback(() => {
        setUsedCards([]);
        setUsedCardIds([]);
        resetChecks();
    }, []);

    const resetChecks = () => {
        setShouldAcceptWord(undefined);
        setWillAcceptWord(undefined);
    };

    const getWordFromCards = useCallback(() => {
        const letters: string[] = [];
        usedCardIds.forEach((id) => {
            const card = allCards.find((card) => card.id === id);
            card ? letters.push(card.letter) : console.log("err no letter");
        });
        return letters.join("").toLowerCase();
    }, [allCards, usedCardIds]);

    const checkWord = useCallback(async () => {
        if (shouldAcceptWord !== undefined) {
            resetChecks();
            return;
        }
        const word = getWordFromCards();

        isValidWord(word)
            .then((ans) => setShouldAcceptWord(ans))
            .then(() => wait().then(resetChecks));

    }, [getWordFromCards, shouldAcceptWord, wait]);


    const startNewGame = () => {
        reset();
        makeNewDeck();
        deal();
    };

    const submit = useCallback(() => {
        if (willAcceptWord === undefined) {
            const word = getWordFromCards();

            isValidWord(word)
                .then((ans) => {
                    setWillAcceptWord(ans);
                })
                .then(() => {
                    addToScore(pointTotal);
                    wait().then(reset);
                });
            return;
        }
        if (willAcceptWord !== undefined) {
            resetChecks();
            return;
        }
    }, [addToScore, getWordFromCards, pointTotal, reset, wait, willAcceptWord]);

    return (
        <div className='App bg-light' style={{ height: "100vh", width: "100vw" }}>
            <Container className='h-100 bg-secondary'>
                <Row className='' style={{ height: "4rem" }}>
                    <Col></Col>
                    <Col className='col-9'>
                        <div className='d-flex flex-row'>
                            {usedCards.map((card) => (
                                <div key={`${card.id}`} className='d-flex flex-row flex-grow-0'>
                                    <div className='fs-6 mt-0 ms-0 text-light'>{card.value}</div>
                                    <div className='py-1 px-2 m-1 fs-1 text-light '>
                                        {card.letter}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                    <Col></Col>
                </Row>
                <Row className=''>
                    <Col></Col>
                    <Col className='justify-content-center'>
                        <div className='d-grid gap-3'>
                            {gridCards.map((card: PointCardType, index: number) => {
                                const { id } = card;
                                const gridArea = gridAreas[index];
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            gridRowStart: gridArea ? gridArea[0] : 0,
                                            gridColumnStart: gridArea ? gridArea[1] : 0,
                                        }}
                                    >
                                        <PointCard
                                            pointCard={card}
                                            chooseCard={chooseCard}
                                            unChooseCard={unChooseCard}
                                            used={usedCardIds.includes(id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className='row mt-5'>
                            <div className='text-light mb-2'>Your Cards</div>
                            <div className='d-flex gap-3 justify-content-center bg-alert'>
                                {handCards.map((card: PointCardType) => {
                                    const { id } = card;
                                    return (
                                        <div className='' key={id}>
                                            <PointCard
                                                pointCard={card}
                                                chooseCard={chooseCard}
                                                unChooseCard={unChooseCard}
                                                used={usedCardIds.includes(id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Col>
                    <Col className='col-2 flex-column'>
                        <Row className='my-2'>
                            <div className='text-light text-start'>Word Points: {pointTotal}</div>
                            <div className='text-light text-start'>
                                Word Length: {usedCards.length}
                            </div>
                        </Row>
                        <Row>
                            <Stack gap={3} className='col-6'>
                                <Button
                                    type='submit'
                                    className='flex-1 btn btn-light'
                                    onClick={reset}
                                >
                                    reset
                                </Button>
                                <Button
                                    className={`flex-1 btn btn-light ${
                                        shouldAcceptWord && "bg-success text-light"
                                    } ${shouldAcceptWord === false && "bg-warning"}`}
                                    onClick={checkWord}
                                >
                                    {`${
                                        shouldAcceptWord === undefined
                                            ? "check word"
                                            : shouldAcceptWord
                                            ? "it's good!!"
                                            : "not a word"
                                    }`}
                                </Button>
                                <Button
                                    className={`flex-1 btn btn-light ${
                                        willAcceptWord && "bg-success text-light"
                                    } ${willAcceptWord === false && "bg-warning"}`}
                                    onClick={submit}
                                >
                                    {`${
                                        willAcceptWord === undefined
                                            ? "submit"
                                            : willAcceptWord
                                            ? "it's good!!"
                                            : "not a word"
                                    }`}
                                </Button>
                                    <div className='text-light text-start'>
                                        Total Score: {score}
                                    </div>
                                    <Button className='flex-1 btn btn-light' onClick={startNewGame}>
                                        New Game
                                    </Button>
                            </Stack>
                        </Row>
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;
