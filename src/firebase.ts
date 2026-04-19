import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, getDocFromServer, arrayUnion, arrayRemove, where, increment } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
console.log('Firebase.ts: Initializing Firebase SDK');
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
console.log('Firebase.ts: SDK Initialized');
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const lowercaseMessage = message.toLowerCase();
  
  // Safe stringification helper to avoid circular structures
  const safeStringify = (obj: any) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return '[Circular]';
        cache.add(value);
      }
      return value;
    });
  };

  const isQuotaError = 
    lowercaseMessage.includes('quota limit exceeded') || 
    lowercaseMessage.includes('quota metric') || 
    lowercaseMessage.includes('resource_exhausted') ||
    lowercaseMessage.includes('rate limit exceeded') ||
    lowercaseMessage.includes('too many requests');

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  console.group(`Firestore Error [${operationType}] - ${path}`);
  console.log('Error Message:', message);
  console.log('Auth State:', errInfo.authInfo);
  console.groupEnd();
  
  // If it's a quota error, we alert the user but don't necessarily crash the whole app load
  if (isQuotaError) {
    return errInfo;
  }

  const errorString = safeStringify(errInfo);

  // Critical Directive: throw for permission issues
  if (message.includes('Missing or insufficient permissions')) {
    throw new Error(errorString);
  }
  
  // For other errors, we throw to ensure they are caught by boundaries
  throw new Error(errorString);
}

export { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, 
  query, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, signInWithPopup, signOut, onAuthStateChanged,
  arrayUnion, arrayRemove, where, increment
};
export type { User };
