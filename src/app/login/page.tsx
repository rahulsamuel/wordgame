'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { UserProfileForm } from '@/components/auth/user-profile-form';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/game');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flashing the form if we are about to redirect
  if (user) return null;

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
      <UserProfileForm />
    </div>
  );
}
