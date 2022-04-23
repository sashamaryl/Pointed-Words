export type GameStateType =
    | "pregame"
    | "init-deal"
    | "word-building"
    | "submit-accept"
    | "submit-reject"
    | "discarding"
    | "confirm-reject"
    | "resetting"
    | "final-round"
    | "game-over";

export const isInSubmitState = (gameState: GameStateType) => {
    return (
        gameState === "submit-accept" ||
        gameState === "discarding" ||
        gameState === "submit-reject" ||
        gameState === "confirm-reject"
    );
};


export const wordWasAccepted = (gameState: GameStateType) => {
    return  gameState === "submit-accept" || gameState === "discarding"
}


export const wordWasRejected = (gameState: GameStateType) => {
    return gameState === "submit-reject" || gameState === "confirm-reject"
}