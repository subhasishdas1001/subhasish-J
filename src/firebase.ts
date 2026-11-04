import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  updatePassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await getDocFromServer(doc(db, 'site_published', 'main'));
    return { connected: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return { connected: false, error: msg };
    }
    return { connected: true };
  }
}
testFirestoreConnection();

export interface SetupLockStatus {
  initialized: boolean;
  adminUid: string | null;
}

/**
 * Checks whether the one-time admin account setup has already been completed.
 * Once `/system_lock/admin_setup` exists in Firestore, no one else can ever register as admin.
 */
export async function checkOneTimeSetupStatus(): Promise<SetupLockStatus> {
  try {
    const lockRef = doc(db, 'system_lock', 'admin_setup');
    const snap = await getDocFromServer(lockRef).catch(() => getDoc(lockRef));
    if (snap.exists() && snap.data()?.initialized === true) {
      return {
        initialized: true,
        adminUid: String(snap.data()?.adminUid || ''),
      };
    }
    return { initialized: false, adminUid: null };
  } catch {
    return { initialized: false, adminUid: null };
  }
}

/**
 * Atomically writes the one-time setup lock and admin user record in Cloud Firestore.
 * Enforced by Firestore security rules so it can only succeed when `!isSetupLocked()`.
 */
async function lockAdminSetupToUser(user: User): Promise<void> {
  const now = new Date().toISOString();
  const batch = writeBatch(db);
  batch.set(doc(db, 'system_lock', 'admin_setup'), {
    initialized: true,
    adminUid: user.uid,
    createdAt: now,
  });
  batch.set(doc(db, 'admins', user.uid), {
    uid: user.uid,
    role: 'admin',
    createdAt: now,
  });
  await batch.commit();
}

/**
 * Verifies if the currently authenticated Firebase user is the authorized administrator.
 */
export async function checkIsAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;

  try {
    const lockStatus = await checkOneTimeSetupStatus();

    // Case 1: One-time setup is locked to a specific UID
    if (lockStatus.initialized) {
      if (lockStatus.adminUid === user.uid) {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        if (adminSnap.exists() && adminSnap.data()?.role === 'admin') {
          return true;
        }
      }
      // Also allow the verified project owner if they signed in via Google
      try {
        await getDocFromServer(doc(db, 'site_draft', 'main'));
        return true;
      } catch {
        return false;
      }
    }

    // Case 2: Setup is not yet locked — check if this user already has admin permission (e.g. verified owner)
    try {
      await getDocFromServer(doc(db, 'site_draft', 'main'));
      await lockAdminSetupToUser(user);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * One-Time Admin Account Setup using Email & Password.
 * Permanently locks `/system_lock/admin_setup` once completed.
 */
export async function completeOneTimeAdminSetup(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !password) {
    throw new Error('Please enter both an email address and a strong password.');
  }
  if (password.length < 8) {
    throw new Error('Admin password must be at least 8 characters long.');
  }

  const status = await checkOneTimeSetupStatus();
  if (status.initialized) {
    throw new Error(
      'One-time admin setup has already been completed. Public registration is permanently disabled.'
    );
  }

  let user: User;
  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );
    user = cred.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'auth/email-already-in-use') {
      // If the owner already created the user in Firebase Console, sign in and bind the one-time lock
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      user = cred.user;
    } else {
      throw err;
    }
  }

  await lockAdminSetupToUser(user);
  return user;
}

/**
 * Standard Admin Login using Firebase Email & Password Authentication.
 */
export async function loginAdminWithEmailPassword(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !password) {
    throw new Error('Please enter your admin email and password.');
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const user = cred.user;

  const status = await checkOneTimeSetupStatus();
  if (!status.initialized) {
    // First-time login for an account created directly in Firebase Console
    await lockAdminSetupToUser(user);
    return user;
  }

  const isAuthorized = await checkIsAdminUser(user);
  if (!isAuthorized) {
    await signOut(auth);
    throw new Error(
      'Access Denied: This account is not authorized to access the Admin Dashboard.'
    );
  }

  return user;
}

/**
 * Admin Login / One-Time Setup using Firebase Google Sign-In.
 */
export async function loginAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const status = await checkOneTimeSetupStatus();
  if (!status.initialized) {
    await lockAdminSetupToUser(user);
    return user;
  }

  const isAuthorized = await checkIsAdminUser(user);
  if (!isAuthorized) {
    await signOut(auth);
    throw new Error(
      'Access Denied: This Google account is not the authorized administrator for this website.'
    );
  }

  return user;
}

/**
 * Securely updates the admin's password in Firebase Authentication.
 */
export async function updateAdminAccountPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated email/password admin user found.');
  }
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export interface FormattedAuthError {
  title: string;
  message: string;
  code?: string;
  consoleHelp?: 'email-provider-disabled' | 'unauthorized-domain';
}

export function formatFirebaseAuthError(error: unknown): FormattedAuthError {
  const code = (error as { code?: string })?.code || '';
  const rawMessage =
    error instanceof Error ? error.message : 'Authentication failed.';

  if (code === 'auth/operation-not-allowed') {
    return {
      title: 'Email/Password Sign-In Provider Not Enabled in Firebase Console',
      message:
        'Firebase rejected Email/Password authentication because the Email/Password sign-in provider is currently disabled in your Firebase project settings.',
      code,
      consoleHelp: 'email-provider-disabled',
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      title: 'Current Domain Not Authorized in Firebase Auth',
      message: `The domain "${window.location.hostname}" needs to be added to Authorized Domains in your Firebase Console.`,
      code,
      consoleHelp: 'unauthorized-domain',
    };
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return {
      title: 'Invalid Admin Credentials',
      message:
        'The email or password you entered does not match the authorized administrator account.',
      code,
    };
  }

  if (code === 'auth/weak-password') {
    return {
      title: 'Password Too Weak',
      message: 'Please choose a stronger password with at least 8 characters.',
      code,
    };
  }

  if (code === 'auth/too-many-requests') {
    return {
      title: 'Too Many Failed Login Attempts',
      message:
        'Access to this account has been temporarily throttled due to multiple failed login attempts. Please wait a moment and try again.',
      code,
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      title: 'Sign-In Popup Blocked',
      message:
        'Your browser blocked the authentication popup. Please allow popups for this site or sign in using Email and Password.',
      code,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      title: 'Sign-In Cancelled',
      message: 'The sign-in window was closed before completing authentication.',
      code,
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      title: 'Network Connection Error',
      message:
        'Could not reach Firebase Authentication servers. Please check your internet connection.',
      code,
    };
  }

  return {
    title: 'Authentication Error',
    message: rawMessage,
    code: code || undefined,
  };
}

export { onAuthStateChanged };
export type { User };
