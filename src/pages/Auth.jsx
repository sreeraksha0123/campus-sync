import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  // 1. LOGIN (Just Authenticate, Don't Auto-Create)
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // The useEffect below will handle fetching the profile
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  // 2. REGISTER (Save User Details to Firestore)
  const registerUser = async (details) => {
    if (!currentUser) return;
    
    const newProfile = {
      name: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      role: "student", 
      ...details, 
    };

    try {
      await setDoc(doc(db, "users", currentUser.uid), newProfile);
      setUserData(newProfile); 
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUserData(null);
    return signOut(auth);
  };

  // 3. MONITOR AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if profile exists in Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           setUserData(docSnap.data());
        } else {
           setUserData(null); 
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, userData, loginWithGoogle, registerUser, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};