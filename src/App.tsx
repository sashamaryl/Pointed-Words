import React, { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import "./App.css";
import { ResultText } from "./common";
import "./custom.scss";
import isValidWord from "./dictionary";
import { WordDisplay } from "./DisplayLetter";
import PointCard, { PointCardType } from "./PointCard";
import { GameStateType, isInSubmitState, wordWasAccepted, wordWasRejected } from "./types";
import useCardDeck from "./usecarddeck";

function App() {
    const {
        allCards,
        gridCards,
        handCards,
        cardDeck,
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
    const [tradeCards, setTradeCards] = useState<number[]>([]);

    const [gameState, setGameState] = useState<GameStateType>("pregame");

    const [isGameActive, setIsGameActive] = useState(false);

    const addToScore = useCallback(
        (newScore: number) => {
            const prevScore = score;
            setScore(newScore + prevScore);
        },
        [score]
    );

    useEffect(() => {
        if (usedCardIds.length <= 0) return;

        if (gameState === "word-building") {
            const cards = idCardLookupMulti(usedCardIds);

            const points = cards.map((card) => card?.value ?? 0).reduce((a, b) => a + b);

            setPointTotal(points);
        }
    }, [gameState, idCardLookupMulti, usedCardIds, usedCards]);

    useEffect(() => {
        cardDeck.length <= 0 && setGameState("game-over");
    }, [cardDeck.length]);

    const chooseCard = useCallback(
        (cardId: number) => {
            if (gameState === "discarding") return;
            const card = allCards.find((card) => card.id === cardId);
            card && setUsedCards([...usedCards, card]);
            setUsedCardIds([...usedCardIds, cardId]);
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
            setGameState("word-building");
        },
        [gameState, usedCardIds, usedCards]
    );

    const setUpNextHand = useCallback(() => {
        if (gameState === "discarding") {
            tradeCards.forEach(tradeInHandCard);
            const cardsRemaining = redealCards(usedCards);
            if (!cardsRemaining) {
                setGameState("game-over");
            }
        }

        setGameState("resetting");
        setUsedCards([]);
        setUsedCardIds([]);
        setTradeCards([]);
        setGameState("word-building");
    }, [gameState, redealCards, tradeCards, tradeInHandCard, usedCards]);

    const getWordFromCards = useCallback(() => {
        const letters: string[] = [];
        usedCardIds.forEach((id) => {
            const card = allCards.find((card) => card.id === id);
            card ? letters.push(card.letter) : console.log("err no letter");
        });
        return letters.join("").toLowerCase();
    }, [allCards, usedCardIds]);

    const startNewGame = () => {
        setIsGameActive(true);
        setGameState("init-deal");
        setUpNextHand();
        deal();
    };

    const endGame = () => {
        clearCards();
        setUsedCards([]);
        setPointTotal(0);
        setUsedCardIds([]);
        setIsGameActive(false);
        setGameState("game-over");
    };

    const submit = useCallback(() => {
        const word = getWordFromCards();

        isValidWord(word).then((ans) => {
            if (ans) {
                setGameState("submit-accept");
                addToScore(pointTotal);
                setPointTotal(0);
            } else {
                setGameState("submit-reject");
            }
        });
    }, [addToScore, getWordFromCards, pointTotal]);

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
            <Container className='h-100 col col-md-6 col-l-4'>
                <div id='header' className='pt-5 text-light'>
                    <h1 className=' text-light'>Pointed Words</h1>
                    <div className=' text-light'>A game by Gene Mackles.</div>
                    <div>
                        Web app by me: <em>Eloise.</em>
                    </div>
                </div>
                <div id='gameboard' className='m-auto h-25'>
                    <div
                        id='word-tray'
                        className='d-flex h-25 w-75 flex-row align-items-end mx-auto border-bottom'
                    >
                        {isGameActive && usedCards.length <= 0 && (
                            <div className='text-light m-auto'>
                                Select from the cards below to make a word
                            </div>
                        )}
                        <WordDisplay usedCards={usedCards} />
                        <ResultText
                            show={isInSubmitState(gameState)}
                            action={() => {
                                gameState === "submit-accept" && setGameState("discarding");
                                gameState === "submit-reject" && setGameState("confirm-reject");
                            }}
                            text={
                                wordWasAccepted(gameState)
                                    ? "is a word!"
                                    : wordWasRejected(gameState)
                                    ? "not a word"
                                    : ""
                            }
                        />
                        {isGameActive && (
                            <Button
                                disabled={usedCards.length <= 0}
                                type='submit'
                                className='flex flex-grow-0 btn btn-light m-1 ms-auto'
                                onClick={setUpNextHand}
                            >
                                reset
                            </Button>
                        )}
                    </div>
                    {isGameActive && (
                        <div className='d-flex m-auto'>
                            <div className='d-flex m-auto my-4'>
                                <div className='d-flex flex-nowrap align-items-center border m-2 px-2'>
                                    <div className='text-start text-light '>Word Points: </div>
                                    <div className='w-100 text-end text-light fs-3'>
                                        {pointTotal}
                                    </div>
                                </div>
                                <Button
                                    className={`flex flex-grow-0 btn btn-light m-1`}
                                    onClick={
                                        gameState === "discarding"
                                            ? setUpNextHand
                                            : gameState === "confirm-reject"
                                            ? () => setGameState("word-building")
                                            : submit
                                    }
                                >
                                    {`${
                                        gameState === "discarding" || gameState === "confirm-reject"
                                            ? "continue"
                                            : "submit"
                                    }`}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div id='card-area' className='d-flex flex-column m-auto'>
                        <div className='text-light mb-2'>
                            {gridCards.length > 0 && "Shared Cards"}
                        </div>
                        <div className='d-flex flex-wrap gap-3 justify-content-center'>
                            {gridCards.map((card: PointCardType, index: number) => {
                                const { id } = card;
                                return (
                                    <div className='col-3' key={id}>
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
                        <div className=' mt-5 '>
                            <div className='text-light mb-2'>
                                {handCards.length > 0 && "Your Cards"}
                            </div>
                            <div className='text-light mb-2'>
                                {gameState === "discarding" &&
                                    "Pick any cards you would like to trade in"}
                            </div>
                            <div className='d-flex gap-3 justify-content-center'>
                                {handCards.map((card: PointCardType, index: number) => {
                                    const { id } = card;
                                    return (
                                        <div
                                            className={`col-3 my-overlay-container flex-shrink-0 p-1 my-transition-50 ${
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

                                                <Button
                                                    className={`my-transition-50 ${
                                                        gameState === "discarding" &&
                                                        !usedCardIds.includes(card.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    } my-overlay w-md-75 shadow text-white`}
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
                                                    Trade
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className='d-flex flex-nowrap m-auto'>
                            <div className='d-flex col'>
                                {isGameActive && (
                                    <div className='col ms-auto me-0'>
                                        <div className='d-flex col flex-nowrap align-items-center border m-2 px-2 '>
                                            <div className='w-100 text-start text-light'>
                                                Total Score:{" "}
                                            </div>
                                            <div className='w-100 text-end text-light fs-3'>
                                                {score}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    className='flex flex-grow-0 btn btn-light m-auto'
                                    onClick={isGameActive ? endGame : startNewGame}
                                >
                                    {isGameActive ? "quit" : "start new game"}
                                </Button>
                                {isGameActive && (
                                    <Button
                                        disabled={gameState !== "discarding"}
                                        className={`flex flex-grow-0 btn btn-primary m-1 my-transition-50 opacity-0 ${
                                            gameState === "discarding" && "opacity-100"
                                        }`}
                                        onClick={setUpNextHand}
                                    >
                                        continue
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default App;
