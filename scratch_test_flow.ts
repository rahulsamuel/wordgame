import { themedPuzzleGeneration } from './src/ai/flows/themed-puzzle-generation-flow';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("Testing puzzle generation...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);
    try {
        const result = await themedPuzzleGeneration({
            theme: 'animals',
            difficulty: 'easy'
        });
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
