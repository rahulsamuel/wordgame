import { themedPuzzleGeneration } from './src/ai/flows/themed-puzzle-generation-flow';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("--- Starting Test ---");
    console.log("Current time:", new Date().toISOString());
    console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Found" : "Missing");
    
    const timeout = setTimeout(() => {
        console.error("Test timed out after 15 seconds!");
        process.exit(1);
    }, 15000);

    try {
        console.log("Calling themedPuzzleGeneration...");
        const result = await themedPuzzleGeneration({
            theme: 'animals',
            difficulty: 'easy'
        });
        clearTimeout(timeout);
        console.log("Success! Result received.");
        console.log("Word list length:", result.wordList.length);
    } catch (error: any) {
        clearTimeout(timeout);
        console.error("Caught error in test:");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
    }
}

test().then(() => console.log("--- Test Finished ---"));
