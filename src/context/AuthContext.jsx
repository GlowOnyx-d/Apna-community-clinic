import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  /**
   * Fetch User Profile from Firestore by real Auth UID
   * 
   * Security Rule: request.auth.uid == userId
   * No collection queries or list permissions needed.
   */
  const syncUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return null;
    const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
    const userDocRef = doc(db, 'users', firebaseUser.uid);

    try {
      // Direct lookup by real Firebase Auth UID
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return { uid: firebaseUser.uid, ...data };
      }

      // Document doesn't exist yet (e.g. legacy document not yet migrated)
      console.warn(`[Auth] No profile document found at users/${firebaseUser.uid}. Please ensure migration has run.`);
      return {
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'patient'
      };
    } catch (err) {
      console.error(`[Auth] Error fetching user profile at users/${firebaseUser.uid}:`, err);
      return {
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'patient'
      };
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await syncUserProfile(fbUser);
        setCurrentUser({ uid: fbUser.uid, email: fbUser.email });
        setUserProfile(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [syncUserProfile]);

  // Sign in via Firebase Auth
  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Please enter both email and password');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      // Fetch profile directly by UID from Firestore
      const profile = await syncUserProfile(cred.user);
      setCurrentUser({ uid: cred.user.uid, email: cred.user.email });
      setUserProfile(profile);
      return profile;
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. If you are using a demo account, please register it first or check credentials.');
      }
      if (err.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      }
      throw new Error(err.message || 'Failed to sign in.');
    }
  };

  // Sign up via Firebase Auth (Always writes profile directly to users/{realAuthUID})
  const signup = async (email, password, extraData = {}) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    try {
      // 1. Create user account in Firebase Auth to get the real Auth UID
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const realAuthUid = cred.user.uid;

      // 2. Prepare profile data with real Auth UID (strictly patient or doctor on public signup)
      const requestedRole = extraData.role;
      const safeRole = requestedRole === 'doctor' ? 'doctor' : 'patient';

      const newProfile = {
        uid: realAuthUid,
        email: cleanEmail,
        name: extraData.name || cleanEmail.split('@')[0],
        role: safeRole,
        phone: extraData.phone || '+91 98765 00000',
        age: Number(extraData.age) || 30,
        gender: extraData.gender || 'Not specified',
        specialization: safeRole === 'doctor' ? (extraData.specialization || '') : '',
        cabin: safeRole === 'doctor' ? (extraData.cabin || 'Cabin 101') : '',
        createdAt: new Date().toISOString()
      };

      // 3. Write directly to users/{realAuthUid}
      await setDoc(doc(db, 'users', realAuthUid), newProfile);

      setCurrentUser({ uid: realAuthUid, email: cleanEmail });
      setUserProfile(newProfile);
      setNeedsSetup(false);
      return newProfile;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      throw new Error(err.message || 'Failed to register account.');
    }
  };

  // First-run master admin creation
  const createInitialAdmin = async ({ name, email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!name || !cleanEmail || !password) {
      throw new Error('All fields are required');
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const realAuthUid = cred.user.uid;

      const adminProfile = {
        uid: realAuthUid,
        name,
        email: cleanEmail,
        role: 'admin',
        isInitialAdmin: true,
        designation: 'Clinic Administrator',
        phone: '+91 98765 43210',
        createdAt: new Date().toISOString()
      };

      // Write directly to users/{realAuthUid}
      await setDoc(doc(db, 'users', realAuthUid), adminProfile);

      setNeedsSetup(false);
      setCurrentUser({ uid: realAuthUid, email: cleanEmail });
      setUserProfile(adminProfile);
      return adminProfile;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      }
      throw new Error(err.message || 'Failed to create admin account.');
    }
  };

  // Register doctor helper
  const createDoctorAccount = async ({ name, email, specialization, phone, cabin }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Email is required for doctor account');
    }

    return {
      email: cleanEmail,
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      role: 'doctor',
      phone: phone || '',
      specialization: specialization || 'General Physician',
      cabin: cabin || 'Cabin 101',
      createdAt: new Date().toISOString()
    };
  };

  // Official Staff / Admin Account Provisioning by Authorized Clinic Administrator
  const provisionStaffAccount = async ({ name, email, password, designation, phone }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!name || !cleanEmail || !password) {
      throw new Error('Name, email, and temporary password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    let realAuthUid;
    try {
      const SECONDARY_APP_NAME = 'SecondaryAdminProvisioner';
      const existingApps = getApps();
      let secondaryApp = existingApps.find(a => a.name === SECONDARY_APP_NAME);
      if (!secondaryApp) {
        const defaultApp = getApp();
        secondaryApp = initializeApp(defaultApp.options, SECONDARY_APP_NAME);
      }
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
      realAuthUid = cred.user.uid;
      await signOut(secondaryAuth);
    } catch (authErr) {
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error(`An account with email "${cleanEmail}" is already registered.`);
      }
      console.warn('[Auth] Notice while provisioning secondary auth account:', authErr);
      realAuthUid = `staff_${Date.now()}`;
    }

    const newStaffProfile = {
      uid: realAuthUid,
      email: cleanEmail,
      name: name.trim(),
      role: 'admin',
      department: designation ? designation.trim() : 'Clinic Operations',
      phone: phone ? phone.trim() : '+91 98765 00000',
      status: 'Active',
      createdAt: new Date().toISOString(),
      provisionedBy: currentUser?.email || 'Clinic Administrator'
    };

    // Save directly to users collection in Firestore
    await setDoc(doc(db, 'users', realAuthUid), newStaffProfile);
    return newStaffProfile;
  };

  // Sign out via Firebase Auth
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value = {
    currentUser,
    userProfile,
    role: userProfile?.role || 'patient',
    loading,
    needsSetup,
    isSupported: true,
    isFolderConnected: true,
    folderName: 'Cloud Firestore',
    connectFolder: async () => ({ success: true }),
    openStorageModal: () => {},
    createDoctorAccount,
    provisionStaffAccount,
    login,
    signup,
    logout,
    createInitialAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
