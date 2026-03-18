'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Puzzle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePuzzleAction } from '../actions';
import type { GameState, PuzzleData, Cell } from './types';
import GameBoard from '@/components/game/game-board';
import GameOverDialog from '@/components/game/game-over-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import { UserProfileForm } from '@/components/auth/user-profile-form';
import { updateUserScore } from '@/lib/firebase';
import { useFirestore } from '@/firebase';

const GAME_DURATION = 180; // 3 minutes

export default function GamePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [gameState, setGameState] = useState<GameState>('setup');
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundWordCoords, setFoundWordCoords] = useState<Cell[][]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);

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
      const processedResult = {
        ...result,
        wordList: result.wordList.map((word) => word.toUpperCase()),
        puzzleGrid: result.puzzleGrid.map(row => row.map(letter => letter.toUpperCase())),
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
    }
  }, [gameState, user, score, firestore]);

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
      toast({
        title: "Here's a hint!",
        description: `Try looking for the word: "${hintWord}". (-5 points)`,
      });
      setScore(prev => prev - 5);
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
        return <UserProfileForm />;
    }

    switch (gameState) {
      case 'setup':
        return (
          <Card className="w-full max-w-lg text-center shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Ready for a challenge, {user.displayName}?</CardTitle>
              <CardDescription>Find all the hidden words before the timer runs out!</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 px-6">
                Click and drag your mouse (or swipe on your screen) to highlight words in the grid.
              </p>
              <Button size="lg" className="font-bold text-lg w-full" onClick={handleStartGame}>
                <Sparkles className="mr-2 h-5 w-5" />
                Start a New Game
              </Button>
            </CardContent>
          </Card>
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
