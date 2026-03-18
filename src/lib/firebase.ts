import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { signInAnonymously, updateProfile, type Auth, type User } from 'firebase/auth';

export async function signInAndCreateProfile(auth: Auth, firestore: Firestore, name: string): Promise<User> {
  const cred = await signInAnonymously(auth);
  await updateProfile(cred.user, { displayName: name });
  const userRef = doc(firestore, 'users', cred.user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    setDoc(userRef, {
      name: name,
      score: 0,
      createdAt: serverTimestamp(),
    });
  }

  return cred.user;
}

export function updateUserScore(firestore: Firestore, userId: string, newScore: number) {
  if (!userId) return;
  const userRef = doc(firestore, 'users', userId);
  getDoc(userRef).then(userDoc => {
      if (userDoc.exists()) {
        const currentScore = userDoc.data()?.score || 0;
        if (newScore > currentScore) {
          updateDoc(userRef, {
            score: newScore,
          });
        }
      }
  });
}
