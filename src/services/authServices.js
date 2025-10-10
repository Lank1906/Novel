import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Đăng ký tài khoản mới
export async function signUp(email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", user.uid), {
    email,
    role: "user",
    createdAt: new Date(),
  });
  return user;
}

// Đăng nhập
export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", user.uid));
  return {
    uid: user.uid,
    email: user.email,
    role: userDoc.data()?.role || "user",
  };
}

const googleProvider = new GoogleAuthProvider();

// Google Sign-In
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      email: user.email,
      role: "user",
      createdAt: new Date(),
    });
  }

  const finalDoc = await getDoc(userDocRef);
  return { uid: user.uid, email: user.email, role: finalDoc.data().role };
}

// Đăng xuất
export async function logout() {
  await signOut(auth);
}

// Theo dõi trạng thái đăng nhập
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) {
      callback(null);
      return;
    }
    const userDoc = await getDoc(doc(db, "users", u.uid));
    callback({
      uid: u.uid,
      email: u.email,
      role: userDoc.data()?.role || "user",
    });
  });
}
