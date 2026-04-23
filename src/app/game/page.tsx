'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Puzzle, Sparkles, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePuzzleAction } from '../actions';
import type { GameState, PuzzleData, Cell } from './types';
import GameBoard from '@/components/game/game-board';
import GameOverDialog from '@/components/game/game-over-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import { updateUserScore, signOutUser, saveGameResult } from '@/lib/firebase';
import { useFirestore, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { GameHistory } from '@/components/game/game-history';

const GAME_DURATION = 180; // 3 minutes

const findWordCoordinates = (grid: string[][], word: string): Cell[] | null => {
  if (!grid || grid.length === 0 || !word) return null;
  const rows = grid.length;
  const cols = grid[0].length;
  const len = word.length;

  const directions = [
      { r: 0, c: 1 },   // horizontal
      { r: 1, c: 0 },   // vertical
      { r: 1, c: 1 },   // diagonal-down-right
      { r: 1, c: -1 },  // diagonal-down-left
      { r: 0, c: -1 },  // horizontal-backward
      { r: -1, c: 0 },  // vertical-backward
      { r: -1, c: -1 }, // diagonal-up-left
      { r: -1, c: 1 },  // diagonal-up-right
  ];

  for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
          if (grid[r][c] === word[0]) {
              for (const dir of directions) {
                  const coords: Cell[] = [];
                  let found = true;
                  for (let i = 0; i < len; i++) {
                      const nextR = r + i * dir.r;
                      const nextC = c + i * dir.c;

                      if (nextR < 0 || nextR >= rows || nextC < 0 || nextC >= cols || grid[nextR][nextC] !== word[i]) {
                          found = false;
                          break;
                      }
                      coords.push({ row: nextR, col: nextC });
                  }
                  if (found) {
                      return coords;
                  }
              }
          }
      }
  }
  return null;
};

export default function GamePage() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundWordCoords, setFoundWordCoords] = useState<Cell[][]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [hintCell, setHintCell] = useState<Cell | null>(null);

  const { toast } = useToast();

  const handleStartGame = useCallback(async () => {
    setGameState('loading');
    const result = await generatePuzzleAction({
      theme: 'animals',
      difficulty: 'easy',
    });

    if (result.error || !result.puzzleGrid || result.wordList.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: result.error || "Couldn't create a puzzle. Please try again.",
      });
      setGameState('setup');
    } else {
      const processedGrid = result.puzzleGrid.map(row => row.map(letter => letter.toUpperCase()));
      const validWordList = result.wordList
        .map((word) => word.toUpperCase())
        .filter(word => findWordCoordinates(processedGrid, word) !== null);

      if (validWordList.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Oops!',
          description: "The AI created an invalid puzzle. Please try again.",
        });
        setGameState('setup');
        return;
      }

      const processedResult = {
        ...result,
        wordList: validWordList,
        puzzleGrid: processedGrid,
      };
      setPuzzleData(processedResult);
      setFoundWords([]);
      setFoundWordCoords([]);
      setScore(0);
      setTimeLeft(GAME_DURATION);
      setGameState('playing');
    }
  }, [toast]);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) {
      if (gameState === 'playing' && timeLeft <= 0) {
        setGameState('over');
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft]);
  
  useEffect(() => {
    if (gameState === 'over' && user) {
        updateUserScore(firestore, user.uid, score);
        if (puzzleData) {
            saveGameResult(firestore, user.uid, score, foundWords.length, puzzleData.wordList.length);
        }
    }
  }, [gameState, user, score, firestore, puzzleData, foundWords.length]);

  const handlePlayAgain = () => {
    setGameState('setup');
    setPuzzleData(null);
  };

  const handleWordFound = useCallback((word: string, coords: Cell[]) => {
    if (!puzzleData) return;

    const upperCaseWord = word.toUpperCase();
    const isWordInList = puzzleData.wordList.includes(upperCaseWord);
    const isAlreadyFound = foundWords.includes(upperCaseWord);

    if (isWordInList && !isAlreadyFound) {
      setFoundWords((prev) => [...prev, upperCaseWord]);
      setFoundWordCoords((prev) => [...prev, coords]);
      setScore((prev) => prev + 10);
      toast({
        title: 'Great find!',
        description: `You found "${upperCaseWord}"! +10 points!`,
      });

      if (foundWords.length + 1 === puzzleData.wordList.length) {
        setGameState('over');
      }
    }
  }, [puzzleData, foundWords, toast]);

  const missedWords = useMemo(() => {
    if (!puzzleData) return [];
    return puzzleData.wordList.filter(word => !foundWords.includes(word));
  }, [puzzleData, foundWords]);

  const handleHint = useCallback(() => {
    if (gameState !== 'playing' || !puzzleData) return;

    const missed = puzzleData.wordList.filter(word => !foundWords.includes(word));
    
    if (missed.length > 0) {
      const hintWord = missed[Math.floor(Math.random() * missed.length)];
      
      const coords = findWordCoordinates(puzzleData.puzzleGrid, hintWord);

      if (coords) {
        const hintCoord = coords[Math.floor(Math.random() * coords.length)];
        setHintCell(hintCoord);
        toast({
            title: "Here's a hint!",
            description: `A letter is flashing for you. (-5 points)`,
        });
        setScore(prev => Math.max(0, prev - 5));

        setTimeout(() => {
            setHintCell(null);
        }, 1000);

      } else {
        toast({
            variant: 'destructive',
            title: 'Hint failed',
            description: "I couldn't find a word to give a hint for right now.",
        });
      }
    } else {
      toast({
        title: 'No hints needed!',
        description: "You've already found all the words!",
      });
    }
  }, [puzzleData, foundWords, gameState, toast]);
  
  const renderContent = () => {
    if(userLoading) {
      return (
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader className="h-16 w-16 animate-spin" />
          <p className="font-headline text-2xl">Loading your profile...</p>
        </div>
      );
    }
    
    if (!user) {
        return null;
    }

    switch (gameState) {
      case 'setup':
        return (
          <div className="flex flex-col items-center w-full max-w-lg">
            <Card className="w-full text-center shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">Ready for a challenge, {user.displayName}?</CardTitle>
                <CardDescription>Find all the hidden words before the timer runs out!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 px-6">
                  Click and drag your mouse (or swipe on your screen) to highlight words in the grid. Words can be horizontal, vertical, or diagonal.
                </p>
                <Button size="lg" className="font-bold text-lg w-full" onClick={handleStartGame}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start a New Game
                </Button>
              </CardContent>
            </Card>
            <GameHistory userId={user.uid} />
          </div>
        );
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4 text-primary">
            <Loader className="h-16 w-16 animate-spin" />
            <p className="font-headline text-2xl">Creating your puzzle...</p>
          </div>
        );
      case 'playing':
        if (!puzzleData) return null;
        return (
          <GameBoard
            puzzleData={puzzleData}
            onWordFound={handleWordFound}
            foundWords={foundWords}
            timeLeft={timeLeft}
            score={score}
            foundWordCoords={foundWordCoords}
            onHintClick={handleHint}
            hintCell={hintCell}
          />
        );
      case 'over':
        return (
          <GameBoard
            puzzleData={puzzleData!}
            onWordFound={() => {}}
            foundWords={foundWords}
            timeLeft={timeLeft}
            score={score}
            foundWordCoords={foundWordCoords}
            isGameOver={true}
            onHintClick={handleHint}
            hintCell={hintCell}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
       <header className="absolute top-0 left-0 right-0 p-4 container mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Puzzle className="h-8 w-8" />
            <span>Word Scramble Dash</span>
        </a>
        {user && (
          <Button variant="ghost" size="sm" onClick={async () => {
            await signOutUser(auth);
            router.replace('/login');
          }}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </header>
      {renderContent()}
      <GameOverDialog
        isOpen={gameState === 'over'}
        score={score}
        foundWordsCount={foundWords.length}
        missedWords={missedWords}
        onPlayAgain={handlePlayAgain}
        timeLeft={timeLeft}
      />
    </div>
  );
}
