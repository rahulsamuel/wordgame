import { Clock, Star, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";

interface GameStatsProps {
  timeLeft: number;
  score: number;
  wordsFound: number;
  totalWords: number;
}

export default function GameStats({ timeLeft, score, wordsFound, totalWords }: GameStatsProps) {
  const timePercentage = (timeLeft / 180) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4 bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className={cn("h-8 w-8 text-primary transition-all", timeLeft <= 10 && "text-destructive animate-pulse")} />
            <p className="text-3xl font-bold tabular-nums">{formatTime(timeLeft)}</p>
          </div>
          <div className="flex items-center gap-3">
             <p className="text-3xl font-bold">{score}</p>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-semibold">
                    <Target className="h-5 w-5 text-accent"/>
                    <span>Words Found</span>
                </div>
                <span className="font-bold text-lg">{wordsFound} / {totalWords}</span>
            </div>
            <Progress value={(wordsFound / totalWords) * 100} className="h-4" />
        </div>
      </CardContent>
    </Card>
  );
}
