import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User, 
  db, 
  doc, 
  setDoc,
  handleFirestoreError,
  OperationType 
} from '../firebase';
import { LogIn, LogOut, ShieldCheck, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

interface FirebaseAuthButtonProps {
  onUserChanged?: (user: User | null) => void;
}

export const FirebaseAuthButton: React.FC<FirebaseAuthButtonProps> = ({ onUserChanged }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (onUserChanged) {
        onUserChanged(currentUser);
      }

      // Sync User Profile to Firestore on login
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Engineer',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            role: 'lead',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Failed to sync user profile to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [onUserChanged]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Lỗi đăng nhập Google Auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowDropdown(false);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
        <span>Firebase Auth...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
          title="Đăng nhập bảo mật Google Sign-In qua Firebase Auth"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng Nhập Google</span>
        </button>
        {errorMsg && (
          <div className="absolute right-0 top-full mt-1 p-2 bg-rose-50 text-rose-800 text-[10px] rounded border border-rose-200 z-50 whitespace-nowrap shadow-md">
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center gap-2 p-1 pl-1.5 pr-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Avatar'}
            className="w-6 h-6 rounded-full border border-slate-300 object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
            {(user.displayName || 'U').charAt(0)}
          </div>
        )}
        <span className="max-w-[100px] truncate text-[11px] font-bold text-slate-800">
          {user.displayName || user.email}
        </span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                {(user.displayName || 'U').charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-900 text-xs block truncate">
                {user.displayName}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Firebase Auth Google Verified
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg space-y-0.5 font-mono">
            <div>UID: <span className="text-slate-800 font-semibold">{user.uid.slice(0, 12)}...</span></div>
            <div>Database: <span className="text-emerald-700 font-bold">Firestore Active</span></div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200/80"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};
