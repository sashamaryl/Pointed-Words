import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Collapse, Fade, Row, Stack } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import "./App.css";
import "./custom.scss";
import isValidWord from "./dictionary";
import PointCard, { PointCardType } from "./PointCard";
import useCardDeck from "./usecarddeck";

function App() {
    const {
        allCards,
        cardDeck,
        gridCards,
        handCards,
        clearCards,
        tradeInHandCard,
        refillGrid,
        deal,
        drawOne,
        drawNumber,
        idCardLookup,
        idCardLookupMulti,
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
    const [canTradeHand, setCanTradeHand] = useState<boolean>(false);
    const [tradeCards, setTradeCards] = useState<number[]>([]);

    const [isTransitioning, setIsTransitioning] = useState(false);

    const [isGameActive, setIsGameActive] = useState(false);

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
        setWillAcceptWord(undefined);
    };

    const unChooseCard = (id: number) => {
        const filteredCards = usedCards.filter((card) => card.id !== id);
        setUsedCards(filteredCards);
        const filteredIds = usedCardIds.filter((usedId) => usedId !== id);
        setUsedCardIds(filteredIds);
        setShouldAcceptWord(undefined);
        setWillAcceptWord(undefined);
    };

    const setUpNextHand = useCallback(() => {
        setUsedCards([]);
        setUsedCardIds([]);
        tradeCards.forEach(tradeInHandCard);
        setCanTradeHand(false);
        setTradeCards([]);
        resetChecks();
        refillGrid(usedCards);
    }, [refillGrid, tradeCards, tradeInHandCard, usedCards]);

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
        setIsGameActive(true);
        setUpNextHand();
        deal();
    };

    const endGame = () => {
        clearCards();
        setIsGameActive(false);
    };

    const submit = useCallback(() => {
        if (willAcceptWord === undefined) {
            const word = getWordFromCards();

            isValidWord(word)
                .then((ans) => {
                    setWillAcceptWord(ans);
                    return ans;
                })
                .then((ans) => {
                    if (ans) {
                        addToScore(pointTotal);
                        setCanTradeHand(true);
                    }
                });
            return;
        }
        if (willAcceptWord !== undefined) {
            resetChecks();
            return;
        }
    }, [addToScore, getWordFromCards, pointTotal, willAcceptWord]);

    return (
        <div className='App bg-secondary' style={{ height: "100vh", width: "100vw" }}>
            <Container className='h-100'>
                <Row className='pt-5'>
                    <div className='d-flex row justify-content-flex-start border m-auto'>
                        {usedCards.map((card) => (
                            <div
                                key={`${card.id}`}
                                className='d-flex col justify-content-start flex-shrink-1 bg-light m-2 rounded'
                            >
                                <div className='fs-6 mt-0 ms-0 text-dark'>{card.value}</div>
                                <div className='py-1 px-2 m-1 fs-1 text-dark '>{card.letter}</div>
                            </div>
                        ))}
                        <div className='col'></div>
                    </div>
                    <div className='d-flex flex-wrap flex-md-nowrap m-auto  m-auto'>
                        <div className='d-flex flex-wrap justify-content-center  '>
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
                                                shouldFade={
                                                    !(willAcceptWord && usedCardIds.includes(id))
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className='row mt-5'>
                                <div className='text-light mb-2'>
                                    {handCards.length > 0 && "Your Cards"}
                                </div>
                                <div className='d-flex gap-3 justify-content-center bg-alert'>
                                    {handCards.map((card: PointCardType, index: number) => {
                                        const { id } = card;
                                        return (
                                            <div className='' key={id}>
                                                <PointCard
                                                    pointCard={card}
                                                    chooseCard={chooseCard}
                                                    unChooseCard={unChooseCard}
                                                    used={usedCardIds.includes(id)}
                                                    shouldFade={
                                                        !(
                                                            canTradeHand &&
                                                            tradeCards.includes(index)
                                                        )
                                                    }
                                                />
                                                <Fade in={canTradeHand} appear>
                                                    <Button
                                                        className={`${
                                                            tradeCards.includes(index)
                                                                ? "bg-secondary"
                                                                : "bg-blue"
                                                        }`}
                                                        onClick={() => {
                                                            tradeCards.includes(index)
                                                                ? setTradeCards((prevState) => {
                                                                      return prevState.filter(
                                                                          (c) => c !== index
                                                                      );
                                                                  })
                                                                : setTradeCards((prevState) => [
                                                                      ...prevState,
                                                                      index,
                                                                  ]);
                                                        }}
                                                    >
                                                        {tradeCards.includes(index)
                                                            ? "Traded"
                                                            : "Trade In"}
                                                    </Button>
                                                </Fade>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className='d-flex flex-nowrap flex-md-wrap m-auto'>
                            <div className=''>
                                <div className='d-flex flex-nowrap justify=content-space m-2 '>
                                    <div className='w-100 text-start'>Word Points: </div>
                                    <div className='w-100 text-end'>{pointTotal}</div>
                                </div>
                                <div className='d-flex justify-content-evenly m-2 '>
                                    <div className='w-100 text-start'>Word Length: </div>
                                    <div className='w-100 text-end'>
                                        {usedCards.length}
                                    </div>
                                </div>
                                <div className='flex d-flex flex-nowrap  m-2 '>
                                    <div className='w-100 text-start'>Total Score: </div>
                                    <div className='w-100 text-end'>{score}</div>
                                </div>
                            </div>
                            <div className='d-flex flex-md-column flex-wrap flex-md-nowrap'>
                                <Button
                                    type='submit'
                                    className='flex flex-grow-1 btn btn-light m-1'
                                    onClick={setUpNextHand}
                                >
                                    reset
                                </Button>
                                <Button
                                    className={`flex flex-grow-1 btn btn-light m-1 ${
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
                                    className={`flex flex-grow-1 btn btn-light m-1 ${
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
                                {
                                    <Button
                                        className='flex flex-grow-1 btn btn-light m-1'
                                        onClick={setUpNextHand}
                                    >
                                        Next Hand
                                    </Button>
                                }
                                <Button
                                    className='flex flex-grow-1 btn btn-light m-1'
                                    onClick={isGameActive ? endGame : startNewGame}
                                >
                                    {isGameActive ? "End Game" : "New Game"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Row>
            </Container>
        </div>
    );
}

export default App;
