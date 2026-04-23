'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserGames, type GameResult } from '@/lib/firebase';
import { useFirestore } from '@/firebase';
import { Loader } from 'lucide-react';
import { format } from 'date-fns';

interface GameHistoryProps {
  userId: string;
}

export function GameHistory({ userId }: GameHistoryProps) {
  const firestore = useFirestore();
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    let isMounted = true;
    const fetchGames = async () => {
      try {
        const history = await getUserGames(firestore, userId);
        if (isMounted) {
          setGames(history);
        }
      } catch (error) {
        console.error("Error fetching game history:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGames();
    return () => { isMounted = false; };
  }, [firestore, userId]);

  if (loading) {
    return (
      <Card className="w-full max-w-lg mt-8">
        <CardContent className="flex justify-center p-6">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card className="w-full max-w-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Game History</CardTitle>
          <CardDescription>You haven't played any games yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Game History</CardTitle>
        <CardDescription>Your past performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Words Found</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  {game.createdAt ? format(game.createdAt.toDate(), 'MMM d, yyyy h:mm a') : 'Just now'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {game.wordsFound} / {game.totalWords}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {game.score}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
