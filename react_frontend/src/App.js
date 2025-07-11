import React, { useState, useEffect } from 'react';
import './App.css';

// Constants for player symbols
const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Helper to determine winner/draw
function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diags
  ];  
  for (let [a,b,c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  if (squares.every(x => x)) return 'draw';
  return null;
}

// Simple AI: pick random empty cell
function getComputerMove(squares) {
  const emptyIndices = squares.map((val, idx) => val ? null : idx).filter(idx => idx !== null);
  if (emptyIndices.length === 0) return null;
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// Square button
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      aria-label={value ? `Cell ${value}` : 'Empty cell'}
      tabIndex={0}
      disabled={!!value}
    >
      {value}
    </button>
  );
}

// Board component
function Board({ squares, onSquareClick, highlightSquares }) {
  return (
    <div className="ttt-board">
      {squares.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => onSquareClick(idx)}
          highlight={highlightSquares && highlightSquares.includes(idx)}
        />
      ))}
    </div>
  );
}

// Game Modes
const GAME_MODES = [
  {
    label: "Single Player (You vs Computer)",
    value: "single"
  },
  {
    label: "Two Players",
    value: "two"
  }
];

// PUBLIC_INTERFACE
function App() {
  // Theme support (existing)
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Main Game State
  const [mode, setMode] = useState('single');
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [highlight, setHighlight] = useState([]);
  const [started, setStarted] = useState(false);

  // Get winner or draw status
  useEffect(() => {
    const winner = calculateWinner(squares);
    if (winner === PLAYER_X || winner === PLAYER_O) {
      setGameOver(true);
      setStatus(`Winner: ${winner === PLAYER_X ? playerLabel(PLAYER_X) : playerLabel(PLAYER_O)}`);
      setHighlight(winningLine(squares, winner));
    } else if (winner === 'draw') {
      setGameOver(true);
      setStatus('It\'s a draw!');
      setHighlight([]);
    } else {
      if (!started) {
        setStatus('Choose mode and press "Start Game"');
      } else {
        setStatus(
          `Turn: ${playerLabel(xIsNext ? PLAYER_X : PLAYER_O)}`
        );
      }
      setGameOver(false);
      setHighlight([]);
    }
    // Only re-run on squares, started
    // eslint-disable-next-line
  }, [squares, started]);

  // Computer Autoplay for single player mode
  useEffect(() => {
    if (
      started &&
      !gameOver &&
      mode === 'single' &&
      !xIsNext // Computer is always 'O'
    ) {
      const timeout = setTimeout(() => {
        const idx = getComputerMove(squares);
        if (idx !== null) {
          handleMove(idx);
        }
      }, 600 + Math.random()*400); // Add brief delay
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [xIsNext, started, gameOver, mode, squares]);

  function playerLabel(symbol) {
    if (mode === 'single') {
      return symbol === PLAYER_X ? "You (X)" : "Computer (O)";
    }
    return symbol === PLAYER_X ? "Player 1 (X)" : "Player 2 (O)";
  }

  function winningLine(squares, winner) {
    // Return indices of winning squares
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] === winner &&
        squares[b] === winner &&
        squares[c] === winner
      ) {
        return [a, b, c];
      }
    }
    return [];
  }

  // Handle user/computer move
  function handleMove(idx) {
    if (gameOver || squares[idx]) return;
    const copy = squares.slice();
    copy[idx] = xIsNext ? PLAYER_X : PLAYER_O;
    setSquares(copy);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    // Only user can click (if not game over and user's turn)
    if (!started || gameOver) return;
    if (mode === 'single' && !xIsNext) return;
    handleMove(idx);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setHighlight([]);
    setStarted(false);
    setStatus('Choose mode and press "Start Game"');
  }

  // PUBLIC_INTERFACE
  function handleStart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setHighlight([]);
    setStarted(true);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    setMode(e.target.value);
    handleReset();
  }

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div className="ttt-title">Tic Tac Toe Online</div>
        <div className="ttt-mode-select">
          <select
            value={mode}
            onChange={handleModeChange}
            aria-label="Select game mode"
            className="ttt-select"
            disabled={started}
          >
            {GAME_MODES.map(g =>
              <option key={g.value} value={g.value}>{g.label}</option>
            )}
          </select>
          {!started ? (
            <button onClick={handleStart} className="ttt-btn ttt-btn-accent" data-testid="start-btn">
              Start Game
            </button>
          ) : (
            <button onClick={handleReset} className="ttt-btn" data-testid="reset-btn">
              Reset
            </button>
          )}
        </div>
        <div className="ttt-status" data-testid="game-status">{status}</div>
        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          highlightSquares={highlight}
        />
        <div className="ttt-footer">
          <span>Made with <span style={{color: "var(--text-secondary)",fontWeight:600}}>React</span></span>
        </div>
      </header>
    </div>
  );
}

export default App;
