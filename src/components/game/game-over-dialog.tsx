import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Award, Clock, ListX, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  foundWordsCount: number;
  missedWords: string[];
  onPlayAgain: () => void;
  timeLeft: number;
}

export default function GameOverDialog({
  isOpen,
  score,
  foundWordsCount,
  missedWords,
  onPlayAgain,
  timeLeft,
}: GameOverDialogProps) {

  const getTitle = () => {
    if (timeLeft > 0 && missedWords.length === 0) return "Amazing! You found them all!";
    if (timeLeft <= 0) return "Time's up!";
    return "Good try!";
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-center">{getTitle()}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Here&apos;s how you did in this round.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-4 bg-secondary p-4 rounded-lg">
            <Award className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-3xl font-bold">{score}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Words Found</p>
              <p className="text-2xl font-bold">{foundWordsCount}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Time Left</p>
              <p className="text-2xl font-bold">{timeLeft > 0 ? `${timeLeft}s` : "0s"}</p>
            </div>
          </div>
          
          {missedWords.length > 0 && (
             <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><ListX className="h-5 w-5 text-destructive" /> Words you missed:</h4>
                <div className="flex flex-wrap gap-2">
                    {missedWords.map(word => (
                        <Badge key={word} variant="destructive">{word}</Badge>
                    ))}
                </div>
             </div>
          )}

        </div>
        <DialogFooter>
          <Button type="button" size="lg" className="w-full font-bold text-lg" onClick={onPlayAgain}>
            <Sparkles className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
