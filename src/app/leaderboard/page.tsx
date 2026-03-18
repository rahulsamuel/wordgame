import { Leaderboard } from "@/components/game/leaderboard";
import { Puzzle } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen items-center p-4 bg-background">
      <header className="absolute top-0 left-0 right-0 p-4 container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Puzzle className="h-8 w-8" />
            <span>Word Scramble Dash</span>
        </Link>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <Leaderboard />
      </main>
    </div>
  );
}
