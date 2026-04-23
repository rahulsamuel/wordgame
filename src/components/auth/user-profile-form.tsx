'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signInAndCreateProfile, signInWithEmail, signUpWithEmail } from '@/lib/firebase';
import { Loader } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
});

export function UserProfileForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("signin");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'signin') {
        if (!values.email || !values.password) {
          setError('Email and password are required.');
          setLoading(false);
          return;
        }
        await signInWithEmail(auth, values.email, values.password);
      } else if (activeTab === 'signup') {
        if (!values.email || !values.password || !values.name) {
          setError('Name, email, and password are required.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(auth, firestore, values.name, values.email, values.password);
      } else if (activeTab === 'guest') {
        if (!values.name) {
          setError('Name is required for guest play.');
          setLoading(false);
          return;
        }
        await signInAndCreateProfile(auth, firestore, values.name);
      }
      // onAuthStateChanged will handle the rest
    } catch (e: any) {
      setError(e.message || 'Authentication failed. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
        <CardDescription>Sign in to save your score or play as a guest.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="guest">Guest</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {(activeTab === 'signup' || activeTab === 'guest') && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(activeTab === 'signin' || activeTab === 'signup') && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {activeTab === 'signin' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : "Let's Play"}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
