import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, auth, db, doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, arrayUnion, arrayRemove, limit, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { InterfaceProfile, UserProfile, TimelinePost, AboutContent } from '../types';
import { INTERFACE_PROFILES } from '../lib/interface/profiles';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  posts: TimelinePost[];
  aboutContent: AboutContent | null;
  quotaExceeded: boolean;
  retryConnection: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserImages: (updates: { avatar?: string; cover?: string }) => Promise<void>;
  updateIntro: (intro: { bio: string; location: string; company: string }) => Promise<void>;
  createPost: (content: string, media?: { url: string; type: 'image' | 'video' }, market_layer?: string) => Promise<void>;
  toggleLike: (postId: string, currentLikes: number) => Promise<void>;
  updateAbout: (content: Partial<AboutContent>) => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // Auto-healing: Propagate refresh when quota is exceeded
  useEffect(() => {
    if (quotaExceeded) {
      // Relaxed retry interval (5 mins) for daily quota resets
      const timer = setInterval(() => {
        console.log('[FirebaseContext] Auto-healing: Attempting to synchronize stream...');
        setRetryTick(prev => prev + 1);
      }, 300000); 
      return () => clearInterval(timer);
    }
  }, [quotaExceeded]);

  const checkUserProfile = async (currentUser: User) => {
    const path = `users/${currentUser.uid}`;
    
    // Safety timeout to prevent infinite sync hang
    const timeout = setTimeout(() => {
      console.warn('[FirebaseContext] Initialization timeout - forcing loading: false');
      setLoading(false);
    }, 8000);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Migration: ensure new interfaceType field exists if old neuroType was present
        const processedData = {
          ...data,
          interfaceType: data.interfaceType || data.neuroType || 'standard_trader'
        } as UserProfile;
        setUserProfile(processedData);
      } else {
        const initialData: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL || '',
          interfaceType: 'standard_trader',
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, initialData);
        setUserProfile(initialData);
      }
      setQuotaExceeded(false); // Reset if successful
    } catch (error) {
      const err = handleFirestoreError(error, OperationType.GET, path);
      if (err) setQuotaExceeded(true);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await checkUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [retryTick]);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      return;
    }
    const path = 'posts';
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimelinePost[];
      setPosts(postsData);
    }, (error) => {
      const err = handleFirestoreError(error, OperationType.LIST, path);
      if (err) setQuotaExceeded(true);
    });

    return () => unsubscribe();
  }, [user, retryTick]);

  useEffect(() => {
    const path = 'about/main';
    const unsubscribe = onSnapshot(doc(db, 'about', 'main'), (doc) => {
      if (doc.exists()) {
        setAboutContent(doc.data() as AboutContent);
      }
    }, (error) => {
      const err = handleFirestoreError(error, OperationType.GET, path);
      if (err) setQuotaExceeded(true);
    });

    return () => unsubscribe();
  }, [retryTick]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() });
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateUserImages = async (updates: { avatar?: string; cover?: string }) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const firestoreUpdates: any = {};
      if (updates.avatar) firestoreUpdates.photoURL = updates.avatar;
      if (updates.cover) firestoreUpdates.coverURL = updates.cover;
      await updateDoc(userDocRef, { ...firestoreUpdates, updatedAt: serverTimestamp() });
      setUserProfile(prev => prev ? { ...prev, ...firestoreUpdates } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateIntro = async (intro: { bio: string; location: string; company: string }) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { intro, updatedAt: serverTimestamp() });
      setUserProfile(prev => prev ? { ...prev, intro } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const createPost = async (content: string, media?: { url: string; type: 'image' | 'video' }, market_layer?: string) => {
    if (!user) return;
    const path = 'posts';
    try {
      await addDoc(collection(db, 'posts'), {
        content,
        mediaUrl: media?.url || '',
        mediaType: media?.type || 'none',
        market_layer: market_layer || 'GLOBAL',
        uid: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: userProfile?.photoURL || user.photoURL || '',
        likesCount: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const toggleLike = async (postId: string, currentLikes: number) => {
    const path = `posts/${postId}`;
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likesCount: currentLikes + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateAbout = async (content: Partial<AboutContent>) => {
    const path = 'about/main';
    try {
      const aboutRef = doc(db, 'about', 'main');
      await setDoc(aboutRef, { ...content, lastUpdated: serverTimestamp() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const retryConnection = async () => {
    console.log('[FirebaseContext] Hard Force Sync initiated...');
    // Clear local throttles to allow fresh institutional checks
    localStorage.removeItem('intelligence_last_run_local');
    
    setQuotaExceeded(false);
    setRetryTick(prev => prev + 1);
    
    if (user) {
      setLoading(true);
      await checkUserProfile(user);
      // Re-trigger services
      const { IntelligenceService } = await import('../services/intelligenceService');
      await IntelligenceService.runCycle();
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading, 
      userProfile, 
      posts, 
      aboutContent,
      quotaExceeded,
      retryConnection,
      updateProfile, 
      updateUserImages,
      updateIntro,
      createPost,
      toggleLike,
      updateAbout,
      logout: async () => {
        const { logout: firebaseLogout } = await import('../firebase');
        await firebaseLogout();
      }
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
}
