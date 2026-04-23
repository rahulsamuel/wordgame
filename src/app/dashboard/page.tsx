'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { GameHistory } from '@/components/game/game-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, LogOut, Puzzle, Play } from 'lucide-react';
import { signOutUser } from '@/lib/firebase';
import { useAuth } from '@/firebase';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Puzzle className="h-8 w-8" />
            <span>Word Scramble Dash</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={async () => {
              await signOutUser(auth);
              router.replace('/');
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-bold">{user.displayName || 'Player'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-bold">{user.email || 'Anonymous'}</p>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href="/game">
                    <Play className="mr-2 h-4 w-4" />
                    Play Game
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            <GameHistory userId={user.uid} />
          </div>
        </div>
      </main>
    </div>
  );
}
