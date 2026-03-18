import type { ThemedPuzzleGenerationOutput } from "@/ai/flows/themed-puzzle-generation-flow";

export type GameState = 'setup' | 'loading' | 'playing' | 'over';

export type PuzzleData = ThemedPuzzleGenerationOutput;

export interface Cell {
  row: number;
  col: number;
}

export interface UserProfile {
    id: string;
    name: string;
    score: number;
}
