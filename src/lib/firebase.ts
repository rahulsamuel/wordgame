import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  type Firestore,
} from 'firebase/firestore';
import { signInAnonymously, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type Auth, type User } from 'firebase/auth';

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

export async function signUpWithEmail(auth: Auth, firestore: Firestore, name: string, email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  
  const userRef = doc(firestore, 'users', cred.user.uid);
  setDoc(userRef, {
    name: name,
    score: 0,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function signInWithEmail(auth: Auth, email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutUser(auth: Auth): Promise<void> {
  return signOut(auth);
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

export interface GameResult {
  id?: string;
  score: number;
  wordsFound: number;
  totalWords: number;
  createdAt?: any;
}

export async function saveGameResult(firestore: Firestore, userId: string, score: number, wordsFound: number, totalWords: number) {
  if (!userId) return;
  const gamesRef = collection(firestore, 'users', userId, 'games');
  await addDoc(gamesRef, {
    score,
    wordsFound,
    totalWords,
    createdAt: serverTimestamp(),
  });
}

export async function getUserGames(firestore: Firestore, userId: string): Promise<GameResult[]> {
  if (!userId) return [];
  const gamesRef = collection(firestore, 'users', userId, 'games');
  const q = query(gamesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as GameResult[];
}
