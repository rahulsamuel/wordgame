import type { PuzzleData, Cell } from "@/app/game/types";
import GameGrid from "./game-grid";
import WordList from "./word-list";
import GameStats from "./game-stats";
import { Card } from "../ui/card";

interface GameBoardProps {
  puzzleData: PuzzleData;
  onWordFound: (word: string, coords: Cell[]) => void;
  foundWords: string[];
  timeLeft: number;
  score: number;
  foundWordCoords: Cell[][];
  isGameOver?: boolean;
  onHintClick: () => void;
  hintCell: Cell | null;
}

export default function GameBoard({
  puzzleData,
  onWordFound,
  foundWords,
  timeLeft,
  score,
  foundWordCoords,
  isGameOver = false,
  onHintClick,
  hintCell,
}: GameBoardProps) {
  return (
    <div className="container mx-auto mt-16 lg:mt-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        <div className="lg:col-span-2">
            <GameGrid
              grid={puzzleData.puzzleGrid}
              onWordSelect={onWordFound}
              foundWordCoords={foundWordCoords}
              disabled={isGameOver}
              hintCell={hintCell}
            />
        </div>
        <div className="space-y-8">
            <GameStats
              timeLeft={timeLeft}
              score={score}
              wordsFound={foundWords.length}
              totalWords={puzzleData.wordList.length}
            />
            <WordList
              words={puzzleData.wordList}
              foundWords={foundWords}
              onHintClick={onHintClick}
              disabled={isGameOver}
            />
        </div>
      </div>
    </div>
  );
}
