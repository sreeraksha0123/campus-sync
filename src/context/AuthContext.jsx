import { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  setPersistence,           
  browserSessionPersistence 
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to convert USN to Email
  const getEmailFromUsn = (usn) => `${usn.toUpperCase().trim()}@campus.sync`;

  // 1. SIGNUP
  const signup = async (usn, password, details) => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      
      const email = getEmailFromUsn(usn);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      await updateProfile(user, { displayName: details.name });

      const newProfile = {
        uid: user.uid,
        email: email, 
        identifier: usn.toUpperCase(), 
        role: "student",
        ...details
      };

      await setDoc(doc(db, "users", user.uid), newProfile);
      setUserData(newProfile);
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  // 2. LOGIN
  const login = async (usn, password) => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      
      const email = getEmailFromUsn(usn);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUserData(null);
    return signOut(auth);
  };

  // 3. MONITOR STATE
  useEffect(() => {
    // 🟢 Ensure persistence is set on load
    setPersistence(auth, browserSessionPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, userData, login, signup, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};