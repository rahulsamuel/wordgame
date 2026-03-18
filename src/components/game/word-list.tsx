import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, List } from "lucide-react";

interface WordListProps {
  words: string[];
  foundWords: string[];
}

export default function WordList({ words, foundWords }: WordListProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <List className="h-6 w-6"/>
          Find These Words
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {words.map((word) => {
            const isFound = foundWords.includes(word);
            return (
              <li key={word} className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-5 w-5 transition-colors", isFound ? "text-green-500" : "text-muted")} />
                <span
                  className={cn(
                    "font-semibold text-lg transition-all",
                    isFound ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {word}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
