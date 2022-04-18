import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import Container from "react-bootstrap/esm/Container";
import "./App.css";
import "./custom.scss";
import PointCard, { PointCardType, PointCardPropsType } from "./PointCard";

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

  const [usedCards, setUsedCards] = useState<PointCardType[]>([]);
  const [pointTotal, setPointTotal] = useState(0);
  const [gridCards, setGridCards] = useState<PointCardType[]>([]);
  const [handCards, setHandcards] = useState<PointCardType[]>([]);

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

  const chooseCard = (pointCard: PointCardType) => {
    setUsedCards([...usedCards, pointCard]);
  };

  const unChooseCard = (id: number) => {
    const filteredCards = usedCards.filter((card) => card.id !== id);
    setUsedCards(filteredCards);
  };

  return (
    <div className='App bg-light' style={{ height: "100vh", width: "100vw" }}>
      <Container className='bg-secondary'>
        <Row className='' style={{ height: "4rem" }}>
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
          <Col className='col-3 bg-secondary'>
            <div className='text-light'>Word Points: {pointTotal}</div>
            <div className='text-light'>Word Length: {usedCards.length}</div>
          </Col>
        </Row>
        <Row className='border border-primary'>
          <Col className='col-9 border border-danger'>
            <div>
              {gridCards.map((card: PointCardType, index: number) => {
                const { id } = card;

                return (
                  <PointCard
                    key={id}
                    pointCard={card}
                    chooseCard={chooseCard}
                    unChooseCard={unChooseCard}
                  />
                );
              })}
            </div>
            <div className='d-flex gap-3 justify-content-center bg-alert'>
              {handCards.map((card: PointCardType) => {
                const { id } = card;
                return (
                  <div className='col' key={id}>
                    <PointCard
                      pointCard={card}
                      chooseCard={chooseCard}
                      unChooseCard={unChooseCard}
                    />
                  </div>
                );
              })}
            </div>
          </Col>

          <Col col={3} className='flex-column border border-light'>
            <Stack gap={3}>
              <Button type='submit' className='flex-1 btn btn-light'>
                submit
              </Button>
              <Button type='submit' className='flex-1 btn btn-light'>
                reset
              </Button>
              <Button type='submit' className='flex-1 btn btn-light'>
                finished
              </Button>
            </Stack>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
