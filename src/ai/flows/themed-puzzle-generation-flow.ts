'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a word scratch puzzle.
 *
 * - themedPuzzleGeneration - A function that generates a unique word scratch puzzle based on theme and difficulty.
 * - ThemedPuzzleGenerationInput - The input type for the themedPuzzleGeneration function.
 * - ThemedPuzzleGenerationOutput - The return type for the themedPuzzleGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const ThemedPuzzleGenerationInputSchema = z.object({
  theme: z.string().describe('The theme for the word scratch puzzle (e.g., "animals", "space").'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The desired difficulty level for the puzzle.'),
});
export type ThemedPuzzleGenerationInput = z.infer<typeof ThemedPuzzleGenerationInputSchema>;

// Output Schema
const ThemedPuzzleGenerationOutputSchema = z.object({
  wordList: z.array(z.string()).describe('A list of words to be found in the puzzle grid.'),
  puzzleGrid: z.array(z.array(z.string().length(1))).describe('A 2D array representing the letter grid of the puzzle.'),
  gridSize: z.object({
    rows: z.number().int().positive().describe('The number of rows in the puzzle grid.'),
    cols: z.number().int().positive().describe('The number of columns in the puzzle grid.'),
  }).describe('The dimensions of the puzzle grid.').optional(), // Marked as optional because LLM might not always specify
});
export type ThemedPuzzleGenerationOutput = z.infer<typeof ThemedPuzzleGenerationOutputSchema>;

export async function themedPuzzleGeneration(input: ThemedPuzzleGenerationInput): Promise<ThemedPuzzleGenerationOutput> {
  return themedPuzzleGenerationFlow(input);
}

const themedPuzzlePrompt = ai.definePrompt({
  name: 'themedPuzzlePrompt',
  input: { schema: ThemedPuzzleGenerationInputSchema },
  output: { schema: ThemedPuzzleGenerationOutputSchema },
  prompt: `You are an expert word puzzle generator. Your task is to create a unique "Word Scratch" puzzle based on a given theme and difficulty.
A Word Scratch puzzle is similar to a Word Search, where players find hidden words in a grid of letters.

First, generate a list of words related to the "{{theme}}" theme.
The difficulty ("{{difficulty}}") should influence the word choice (e.g., common vs. obscure words) and the quantity of words.
- For 'easy' difficulty: 5-8 common words.
- For 'medium' difficulty: 8-12 moderately common words.
- For 'hard' difficulty: 12-18 more obscure or challenging words.

Second, create a square or rectangular grid (puzzleGrid) and strategically embed all the generated words into it.
The grid size should be appropriate for the number of words and difficulty.
- For 'easy' difficulty: A smaller grid (e.g., 8x8 to 10x10). Words should mostly be horizontal or vertical, and only forward-facing.
- For 'medium' difficulty: A medium-sized grid (e.g., 10x10 to 12x12). Words can be horizontal, vertical, and diagonal (forward-facing). Some overlaps are acceptable.
- For 'hard' difficulty: A larger grid (e.g., 12x12 to 15x15). Words can be horizontal, vertical, diagonal, and backward-facing in all directions. Encourage word intersections for increased complexity.

After embedding the words, fill any remaining empty cells in the 'puzzleGrid' with random uppercase English letters to complete the puzzle.
Ensure the 'puzzleGrid' is a 2D array of single uppercase letters.
Finally, specify the 'gridSize' as an object with 'rows' and 'cols' representing the dimensions of the generated 'puzzleGrid'. This is important for the UI.

Example for 'easy' difficulty with theme 'fruit':
```json
{
  "wordList": ["APPLE", "BANANA", "GRAPE", "LEMON"],
  "puzzleGrid": [
    ["A", "P", "P", "L", "E", "X", "Y", "Z"],
    ["B", "A", "N", "A", "N", "A", "Q", "W"],
    ["G", "R", "A", "P", "E", "S", "D", "F"],
    ["L", "E", "M", "O", "N", "K", "J", "H"],
    ["C", "V", "B", "N", "M", "L", "K", "J"],
    ["X", "Y", "Z", "A", "B", "C", "D", "E"],
    ["F", "G", "H", "I", "J", "K", "L", "M"],
    ["N", "O", "P", "Q", "R", "S", "T", "U"]
  ],
  "gridSize": {
    "rows": 8,
    "cols": 8
  }
}
```

Now generate the puzzle. Provide your response in JSON format only.`,
});

const themedPuzzleGenerationFlow = ai.defineFlow(
  {
    name: 'themedPuzzleGenerationFlow',
    inputSchema: ThemedPuzzleGenerationInputSchema,
    outputSchema: ThemedPuzzleGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await themedPuzzlePrompt(input);
    if (!output) {
      throw new Error('Failed to generate puzzle output.');
    }
    return output;
  }
);
