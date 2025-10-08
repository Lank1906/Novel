import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
  return { ...user, ...userDoc.data() };
}

// Đăng xuất
export async function logout() {
  await signOut(auth);
}

// Theo dõi trạng thái đăng nhập
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
