import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Collapse, Fade, Modal, Overlay, Row, Stack } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import "./App.css";
import "./custom.scss";
import isValidWord from "./dictionary";
import DisplayLetter, { WordDisplay } from "./DisplayLetter";
import PointCard, { PointCardType } from "./PointCard";
import useCardDeck from "./usecarddeck";
import { GameStateType } from "./types";
import { gridAreas } from "./gridAreas";

function App() {
    const {
        allCards,
        gridCards,
        handCards,
        clearCards,
        tradeInHandCard,
        redealCards,
        deal,
        idCardLookupMulti,
    } = useCardDeck();

    const [usedCardIds, setUsedCardIds] = useState<number[]>([]);
    const [usedCards, setUsedCards] = useState<PointCardType[]>([]);

    const [pointTotal, setPointTotal] = useState(0);
    const [score, setScore] = useState(0);
    const [shouldAcceptWord, setShouldAcceptWord] = useState<boolean | undefined>(undefined);
    const [willAcceptWord, setWillAcceptWord] = useState<boolean | undefined>(undefined);
    const [tradeCards, setTradeCards] = useState<number[]>([]);

    const [gameState, setGameState] = useState<GameStateType>("pregame");

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

    const chooseCard = useCallback(
        (cardId: number) => {
            if (gameState === "discarding") return;
            const card = allCards.find((card) => card.id === cardId);
            card && setUsedCards([...usedCards, card]);
            setUsedCardIds([...usedCardIds, cardId]);
            setShouldAcceptWord(undefined);
            setWillAcceptWord(undefined);
            setGameState("word-building");
        },
        [allCards, gameState, usedCardIds, usedCards]
    );

    const unChooseCard = useCallback(
        (id: number) => {
            if (gameState === "discarding") return;
            const filteredCards = usedCards.filter((card) => card.id !== id);
            setUsedCards(filteredCards);
            const filteredIds = usedCardIds.filter((usedId) => usedId !== id);
            setUsedCardIds(filteredIds);
            setShouldAcceptWord(undefined);
            setWillAcceptWord(undefined);
            setGameState("word-building");
        },
        [gameState, usedCardIds, usedCards]
    );

    const setUpNextHand = useCallback(() => {
        setGameState("resetting");
        tradeCards.forEach(tradeInHandCard);
        redealCards(usedCards);

        setUsedCards([]);
        setUsedCardIds([]);
        setTradeCards([]);
        resetChecks();
        setGameState("word-building");
    }, [redealCards, tradeCards, tradeInHandCard, usedCards]);

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
        setGameState("init-deal");
        setUpNextHand();
        deal();
    };

    const endGame = () => {
        clearCards();
        setUsedCards([]);
        setUsedCardIds([]);
        setIsGameActive(false);
        setGameState("game-over");
    };

    const submit = useCallback(() => {
        if (willAcceptWord !== undefined) {
            resetChecks();
            return;
        }

        if (gameState === "submit-accept" || gameState === "submit-reject") {
            resetChecks();
            return;
        }

        const word = getWordFromCards();

        isValidWord(word)
            .then((ans) => {
                setWillAcceptWord(ans);
                return ans;
            })
            .then((ans) => {
                if (ans) {
                    addToScore(pointTotal);
                    setGameState("discarding");
                }
            });
    }, [addToScore, gameState, getWordFromCards, pointTotal, willAcceptWord]);

    const injectStyles = () => {
        return (
            <style>
                {`
                .my-transition-50 {
                    transition: linear 500ms
                }
                .my-overlay {
                    position: relative;
                    top: -10px;
                }
                .my-overlay-container {
                    position: relative;

                }
           `}
            </style>
        );
    };

    return (
        <div className='App bg-secondary vh-100 vw-100'>
            {injectStyles()}
            <Container className='h-100'>
                <Row className='w-75 h-75 m-auto border border-primary'>
                    <div className='d-flex flex-row align-items-end col-10 mx-auto h-25 border-bottom'>
                        <WordDisplay usedCards={usedCards} />
                        {gameState}
                        {willAcceptWord === undefined ? (
                            <></>
                        ) : willAcceptWord ? (
                            <div
                                className={
                                    "fs-1 text-uppercase width-25 text-light text-align-right ms-auto"
                                }
                            >
                                it's good!!
                            </div>
                        ) : (
                            <div
                                className={
                                    " fs-1 text-uppercase width-25 text-light text-align-right ms-auto"
                                }
                            >
                                try again
                            </div>
                        )}
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
                                            <div
                                                className={`my-overlay-container flex-grow-0 p-1 my-transition-50 ${
                                                    tradeCards.includes(index)
                                                        ? "opacity-50"
                                                        : "opacity-100"
                                                }`}
                                                key={id}
                                            >
                                                <div className=''>
                                                    <PointCard
                                                        pointCard={card}
                                                        chooseCard={chooseCard}
                                                        unChooseCard={unChooseCard}
                                                        used={usedCardIds.includes(id)}
                                                    />
                                                    {gameState === "discarding" &&
                                                        !usedCardIds.includes(card.id) && (
                                                            <Button
                                                                className={`my-overlay w-75 shadow border border-3 border-primary text-white`}
                                                                onClick={() => {
                                                                    tradeCards.includes(index)
                                                                        ? setTradeCards(
                                                                              (prevState) => {
                                                                                  return prevState.filter(
                                                                                      (c) =>
                                                                                          c !==
                                                                                          index
                                                                                  );
                                                                              }
                                                                          )
                                                                        : setTradeCards(
                                                                              (prevState) => [
                                                                                  ...prevState,
                                                                                  index,
                                                                              ]
                                                                          );
                                                                }}
                                                            >
                                                                Trade
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className='d-flex flex-nowrap flex-md-wrap m-auto'>
                            {isGameActive && (
                                <div className=''>
                                    <div className='d-flex col flex-nowrap align-items-center border m-2 px-2'>
                                        <div className='w-100 text-start text-light '>
                                            Word Points:{" "}
                                        </div>
                                        <div className='w-100 text-end text-light'>
                                            {pointTotal}
                                        </div>
                                    </div>
                                    <div className='d-flex col flex-nowrap align-items-center border m-2 px-2 '>
                                        <div className='w-100 text-start text-light'>
                                            Total Score:{" "}
                                        </div>
                                        <div className='w-100 text-end text-light'>{score}</div>
                                    </div>
                                </div>
                            )}
                            <div className='d-flex flex-md-column col flex-wrap flex-md-nowrap'>
                                {isGameActive && (
                                    <>
                                        {" "}
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
                                        <Button
                                            className='flex flex-grow-1 btn btn-light m-1'
                                            onClick={setUpNextHand}
                                        >
                                            next hand
                                        </Button>
                                    </>
                                )}
                                <Button
                                    className='flex flex-grow-1 btn btn-light m-1'
                                    onClick={isGameActive ? endGame : startNewGame}
                                >
                                    {isGameActive ? "end game" : "new game"}
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
