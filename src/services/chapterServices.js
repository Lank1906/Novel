import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// Lấy thông tin truyện
export const getNovelById = async (id) => {
  const ref = doc(db, "novels", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// Lấy chapter theo novel
export const getChaptersByNovelId = async (novelId) => {
  const q = query(
    collection(db, `novels/${novelId}/chapters`),
    orderBy("order")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Thêm chapter mới
export const addChapter = async (novelId, data) => {
  const listSnap = await getDocs(collection(db, `novels/${novelId}/chapters`));
  const order = listSnap.size + 1;
  await addDoc(collection(db, `novels/${novelId}/chapters`), {
    ...data,
    order,
    createdAt: serverTimestamp(),
  });
};

// Cập nhật chapter
export const updateChapter = async (novelId, id, data) => {
  const ref = doc(db, `novels/${novelId}/chapters`, id);
  await updateDoc(ref, { ...data });
};

// Xóa chapter
export const deleteChapter = async (novelId, id) => {
  const ref = doc(db, `novels/${novelId}/chapters`, id);
  await deleteDoc(ref);
};
