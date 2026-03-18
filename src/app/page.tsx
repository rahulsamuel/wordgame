import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Puzzle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
            <Puzzle className="h-8 w-8" />
            <span>Word Scramble Dash</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Find the words, beat the clock!
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome to Word Scramble Dash, the super-fun word search game where you race against time. Can you find all the hidden words in just 3 minutes? Let&apos;s play!
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="font-bold text-lg">
                  <Link href="/game">
                    Play Now! <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Word Scramble Dash. Ready, set, find!</p>
      </footer>
    </div>
  );
}
