import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";

describe("Tic Tac Toe App", () => {
  test("renders title and status message", () => {
    render(<App />);
    expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
    expect(screen.getByTestId("game-status")).toBeInTheDocument();
  });

  test("has mode select and start/reset button", () => {
    render(<App />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Game/i })).toBeInTheDocument();
  });

  test("start game disables mode select and enables moves", () => {
    render(<App />);
    const startBtn = screen.getByRole("button", { name: /Start Game/i });
    fireEvent.click(startBtn);
    expect(screen.getByRole("combobox")).toBeDisabled();
    // Have 9 cells that can be clicked after start
    const squares = screen.getAllByRole("button", { name: /cell/i });
    expect(squares.length).toBe(9);
  });

  test("makes move as Player X and disables cell", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Start Game/i }));
    const square = screen.getAllByRole("button", { name: /cell/i })[0];
    fireEvent.click(square);
    expect(square).toHaveTextContent("X");
    expect(square).toBeDisabled();
  });

  test("reset returns board to initial state", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Start Game/i }));
    const squares = screen.getAllByRole("button", { name: /cell/i });
    fireEvent.click(squares[0]);
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect(screen.getAllByRole("button", { name: /cell/i }).every(b => b.textContent === "")).toBe(true);
  });

  test("two-player mode alternates turns correctly", () => {
    render(<App />);
    fireEvent.change(screen.getByRole("combobox"), {target: {value: "two"}});
    fireEvent.click(screen.getByRole("button", { name: /Start Game/i }));
    const squares = screen.getAllByRole("button", { name: /cell/i });
    fireEvent.click(squares[0]); // X
    expect(squares[0]).toHaveTextContent("X");
    fireEvent.click(squares[1]); // O
    expect(squares[1]).toHaveTextContent("O");
  });

  test("declares winner and disables moves", () => {
    render(<App />);
    fireEvent.change(screen.getByRole("combobox"), {target: {value: "two"}});
    fireEvent.click(screen.getByRole("button", { name: /Start Game/i }));
    // X O X
    // O X
    //     X
    const moves = [0,3,1,4,2,5,6,7,8]; // X,O,X,O,X,O....
    const squares = () => screen.getAllByRole("button", { name: /cell/i });
    fireEvent.click(squares()[0]); // X
    fireEvent.click(squares()[3]); // O
    fireEvent.click(squares()[1]); // X
    fireEvent.click(squares()[4]); // O
    fireEvent.click(squares()[2]); // X - win
    expect(screen.getByTestId("game-status")).toHaveTextContent(/winner/i);
    // All cells disabled or filled
    squares().forEach(btn => expect(btn).toBeDisabled());
  });
});
