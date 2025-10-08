import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), { role });
}
