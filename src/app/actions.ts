
'use server';

import { themedPuzzleGeneration, ThemedPuzzleGenerationInput, ThemedPuzzleGenerationOutput } from '@/ai/flows/themed-puzzle-generation-flow';

type PuzzleGenerationResult = ThemedPuzzleGenerationOutput & { error?: string };

export async function generatePuzzleAction(input: ThemedPuzzleGenerationInput): Promise<PuzzleGenerationResult> {
    try {
        const result = await themedPuzzleGeneration(input);
        
        if (!result || !result.puzzleGrid || result.puzzleGrid.length === 0) {
            throw new Error("AI failed to generate a valid puzzle grid.");
        }

        // The AI might not return a grid size, so we calculate it if it's missing.
        if (result && !result.gridSize) {
            result.gridSize = {
                rows: result.puzzleGrid.length,
                cols: result.puzzleGrid[0]?.length || 0,
            };
        }
        return result as PuzzleGenerationResult;
    } catch (error: any) {
        console.error("Error generating puzzle:", error);
        return { 
            error: `Error: ${error?.message || "Unknown error"}. Please try again in a moment!`,
            wordList: [],
            puzzleGrid: [],
            gridSize: { rows: 0, cols: 0 }
        };
    }
}
