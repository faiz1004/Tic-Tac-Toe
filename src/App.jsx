import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import "./App.css";

// Function to launch confetti when a player wins
const launchConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });
};

// Square component with conditional winning colors
const Square = ({ value, onClick, isWinningSquare, winningPlayer }) => {
  let winningClass = "";
  if (isWinningSquare) {
    winningClass = winningPlayer === "X" ? "winning-square-green" : "winning-square-red";
  }

  return (
    <button className={`square ${winningClass}`} onClick={onClick}>
      {value}
    </button>
  );
};

// Board component
const Board = ({ squares, onClick, winningLine, winningPlayer }) => (
  <div className="board">
    {squares.map((square, i) => (
      <Square
        key={i}
        value={square}
        onClick={() => onClick(i)}
        isWinningSquare={winningLine?.includes(i)}
        winningPlayer={winningPlayer}
      />
    ))}
  </div>
);

// Start page for choosing game mode
const StartPage = ({ onStartGame }) => {
  const [gameMode, setGameMode] = useState("Friend");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const handleStart = () => {
    if (gameMode === "Friend" && (!player1 || !player2)) {
      alert("Please enter both player names!");
      return;
    }
    onStartGame(gameMode, player1 || "Player 1", player2 || "Player 2");
  };

  return (
    <div className="start-container">
      <h1>Tic-Tac-Toe</h1>
      <div className="mode-selection">
        <button onClick={() => setGameMode("Computer")} className={gameMode === "Computer" ? "active-mode" : ""}>
          Play with AI
        </button>
        <button onClick={() => setGameMode("Friend")} className={gameMode === "Friend" ? "active-mode" : ""}>
          Play with Friend
        </button>
      </div>

      {gameMode === "Friend" && (
        <div className="player-inputs">
          <input type="text" placeholder="Player 1 Name" value={player1} onChange={(e) => setPlayer1(e.target.value)} />
          <input type="text" placeholder="Player 2 Name" value={player2} onChange={(e) => setPlayer2(e.target.value)} />
        </div>
      )}

      <button className="start-button" onClick={handleStart}>
        Start Game
      </button>
    </div>
  );
};

// Main App component
const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [isXNext, setIsXNext] = useState(true);
  const [difficulty, setDifficulty] = useState("Easy");
  const [gameMode, setGameMode] = useState("Friend");
  const [player1, setPlayer1] = useState("Player 1");
  const [player2, setPlayer2] = useState("Player 2");

  const currentSquares = history[stepNumber];
  const { winner, winningLine } = calculateWinner(currentSquares);

  const status = winner
    ? `Winner: ${winner === "X" ? player1 : player2}`
    : currentSquares.includes(null)
    ? `Next Player: ${isXNext ? player1 : player2}`
    : "It's a Draw!";

  useEffect(() => {
    if (winner) {
      launchConfetti();
    }
  }, [winner]);

  useEffect(() => {
    if (!isXNext && gameMode === "Computer" && !winner) {
      setTimeout(() => aiMove(), 500);
    }
  }, [isXNext, gameMode, winner]);

  const handleClick = (i) => {
    if (currentSquares[i] || winner) return;

    const newSquares = [...currentSquares];
    newSquares[i] = isXNext ? "X" : "O";

    setHistory([...history.slice(0, stepNumber + 1), newSquares]);
    setStepNumber(stepNumber + 1);
    setIsXNext(!isXNext);
  };

  const aiMove = () => {
    let newSquares = [...history[stepNumber]];
    const bestMove = getBestMove(newSquares, difficulty);

    if (bestMove !== -1) {
      newSquares[bestMove] = "O";
      setHistory([...history.slice(0, stepNumber + 1), newSquares]);
      setStepNumber(stepNumber + 1);
      setIsXNext(true);
    }
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setStepNumber(0);
    setIsXNext(true);
  };

  const startGame = (mode, p1, p2) => {
    setGameMode(mode);
    setPlayer1(p1);
    setPlayer2(p2);
    setGameStarted(true);
    resetGame();
  };

  return (
    <div className="game-container">
      {!gameStarted ? (
        <StartPage onStartGame={startGame} />
      ) : (
        <div className="game">
          <h1>Tic-Tac-Toe</h1>
          <p>{status}</p>
          <Board squares={currentSquares} onClick={handleClick} winningLine={winningLine} winningPlayer={winner} />
          <div className="controls">
            <button onClick={resetGame}>Restart Game</button>
            {gameMode === "Computer" && (
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Winning logic function
const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningLine: line };
    }
  }
  return { winner: null, winningLine: null };
};

// AI Logic
const getBestMove = (squares, difficulty) => {
  return difficulty === "Easy" ? getRandomMove(squares) : getMinimaxMove(squares);
};

const getRandomMove = (squares) => {
  const availableMoves = squares.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null);
  return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
};

const getMinimaxMove = (squares) => {
  return getRandomMove(squares);
};

export default App;
