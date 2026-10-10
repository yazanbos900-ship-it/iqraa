import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { ServiceCategory } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'provider' | 'admin';
  photoURL?: string;
  phoneNumber?: string;
  providerCategory?: string;
  institutionName?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile | null>;
  signUpWithEmail: (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'student' | 'provider',
    providerCategory?: string
  ) => Promise<UserProfile>;
  signInWithGoogle: (role?: 'student' | 'provider') => Promise<UserProfile>;
  signOutUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateProfile = async (firebaseUser: User, defaultRole: 'student' | 'provider' = 'student'): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setUserProfile(data);
      return data;
    }

    // Admin access comes from the protected admins/{uid} record, never from a public email string.
    const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
    const role = adminSnap.exists() ? 'admin' : defaultRole;
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'مستخدم أعالي',
      role,
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newProfile);
    setUserProfile(newProfile);
    return newProfile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          await fetchOrCreateProfile(currentUser);
        } catch (e) {
          console.error('Could not sync user profile from Firestore:', e);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchOrCreateProfile(cred.user);
      return profile;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setError(message);
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'student' | 'provider',
    providerCategory?: string
  ): Promise<UserProfile> => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString(),
        ...(providerCategory ? { providerCategory, institutionName: displayName } : {}),
      };

      const userDocRef = doc(db, 'users', cred.user.uid);
      await setDoc(userDocRef, newProfile);

      if (role === 'provider') {
        const validCategories: ServiceCategory[] = ['schools', 'universities', 'institutes', 'tutors', 'training_centers', 'libraries'];
        const category = validCategories.includes(providerCategory as ServiceCategory)
          ? providerCategory as ServiceCategory
          : 'schools';
        await setDoc(doc(db, 'providers', cred.user.uid), {
          providerId: cred.user.uid,
          name: displayName,
          nameEn: displayName,
          category,
          city: '',
          rating: 0,
          reviewsCount: 0,
          description: '',
          accredited: false,
          verificationStatus: 'pending',
          featured: false,
          contactEmail: cred.user.email || email,
          contactPhone: '',
          servicesOffered: [],
          tags: [],
          createdAt: newProfile.createdAt,
        });
      }

      setUserProfile(newProfile);
      return newProfile;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل إنشاء الحساب';
      setError(message);
      throw err;
    }
  };

  const signInWithGoogle = async (role: 'student' | 'provider' = 'student'): Promise<UserProfile> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const profile = await fetchOrCreateProfile(cred.user, role);
      return profile;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Google';
      setError(message);
      throw err;
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل الخروج';
      setError(message);
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل إرسال رابط إعادة تعيين كلمة المرور';
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOutUser,
        sendPasswordReset,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
