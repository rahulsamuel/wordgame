'use client';
import { useCollection } from "@/firebase/firestore/use-collection";
import { UserProfile } from "@/app/game/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Award, Loader } from "lucide-react";

export function Leaderboard() {
  const users = useCollection<UserProfile>('users', 'score');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl font-headline">
          <Award className="h-8 w-8 text-yellow-400" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top 10 players with the highest scores.</CardDescription>
      </CardHeader>
      <CardContent>
        {!users ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="text-right font-bold">{user.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
