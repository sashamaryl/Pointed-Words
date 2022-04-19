import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import "./App.css";
import "./custom.scss";
import PointCard, { PointCardType } from "./PointCard";
import isValidWord from "./dictionary";

function App() {
  const cardValues: PointCardType[] = useMemo(
    () => [
      { id: 101, value: 1, letter: "A" },
      { id: 102, value: 2, letter: "B" },
      { id: 103, value: 2, letter: "G" },
      { id: 104, value: 1, letter: "N" },
      { id: 105, value: 1, letter: "L" },
      { id: 106, value: 9, letter: "O" },
      { id: 107, value: 1, letter: "E" },
      { id: 108, value: 1, letter: "E" },
      { id: 109, value: 1, letter: "S" },
      { id: 110, value: 1, letter: "A" },
      { id: 111, value: 1, letter: "T" },
      { id: 112, value: 1, letter: "S" },
    ],
    []
  );

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
  const [gridCards, setGridCards] = useState<PointCardType[]>([]);
  const [handCards, setHandcards] = useState<PointCardType[]>([]);
  const [score, setScore] = useState(0);
  const [shouldAcceptWord, setShouldAcceptWord] = useState<boolean | undefined>(undefined);

  const addToScore = (newScore: number) => {
    const prevScore = score;
    setScore(newScore + prevScore);
  };

  const removeCards = (ids: number[]) => {
    return null;
  };

  useEffect(() => {
    const flopCards = cardValues.slice(0, 9);
    setGridCards(flopCards);
    const hand = cardValues.slice(9, 12);
    setHandcards(hand);
  }, [cardValues]);

  useEffect(() => {
    const points: number =
      usedCards.length > 0 ? usedCards.map((card) => card.value).reduce((a, b) => a + b) : 0;
    setPointTotal(points);
  }, [usedCards]);

  const chooseCard = (cardId: number) => {
    const card = cardValues.find((card) => card.id === cardId);
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

  const submit = () => {
    addToScore(pointTotal);
    removeCards([]);
    setShouldAcceptWord(undefined);
  };

  const reset = () => {
    setUsedCards([]);
    setUsedCardIds([]);
    setShouldAcceptWord(undefined);
  };

  const checkWord = useCallback(() => {
    const letters: string[] = [];

    usedCardIds.forEach((id) => {
      const card = cardValues.find((card) => card.id === id);
      card ? letters.push(card.letter) : console.log("err no letter");
    });

    const word = letters.join("").toLowerCase();

    isValidWord(word).then((ans) => setShouldAcceptWord(ans));

    setTimeout(() => setShouldAcceptWord(undefined), 3000);
  }, [cardValues, usedCardIds]);

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
                  <div className='py-1 px-2 m-1 fs-1 text-light '>{card.letter}</div>
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
              <div className='text-light text-start'>Word Length: {usedCards.length}</div>
            </Row>
            <Row>
              <Stack gap={3} className='col-6'>
                <Button type='submit' className='flex-1 btn btn-light' onClick={submit}>
                  submit
                </Button>
                <Button className={`flex-1 btn btn-light ${shouldAcceptWord && 'bg-success text-light'}`} onClick={checkWord}>
                  {`${
                    shouldAcceptWord === undefined
                      ? "check word"
                      : shouldAcceptWord
                      ? "it's good!!"
                      : "not a word"
                  }`}
                </Button>
                <Button type='submit' className='flex-1 btn btn-light' onClick={reset}>
                  reset
                </Button>
                <Button type='submit' className='flex-1 btn btn-light'>
                  finished
                </Button>
                <Row>
                  <div className='text-light text-start'>Total Score: {score}</div>
                </Row>
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
