import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const novelsRef = collection(db, "novels");

// 🧩 1️⃣ Lấy danh sách (phân trang + search)
export async function getNovels({
  pageSize = 10,
  lastDoc = null,
  searchTerm = "",
}) {
  let q;
  if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase();
    q = query(
      novelsRef,
      where("titleLower", ">=", search),
      where("titleLower", "<=", search + "\uf8ff"),
      orderBy("titleLower"),
      limit(pageSize)
    );
  } else {
    q = query(novelsRef, orderBy("createdAt", "desc"), limit(pageSize));
  }

  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const novels = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastVisible = snap.docs[snap.docs.length - 1] || null;
  return { novels, lastVisible };
}

// 🧩 2️⃣ Lấy chi tiết 1 truyện
export async function getNovelById(id) {
  const docRef = doc(db, "novels", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Novel not found");
  return { id: snap.id, ...snap.data() };
}

// 🧩 3️⃣ Thêm mới truyện
export async function addNovel(data) {
  const payload = {
    ...data,
    titleLower: data.title.toLowerCase(),
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(novelsRef, payload);
  return docRef.id;
}

// 🧩 4️⃣ Cập nhật truyện
export async function updateNovel(id, data) {
  const docRef = doc(db, "novels", id);
  await updateDoc(docRef, {
    ...data,
    titleLower: data.title?.toLowerCase() ?? undefined,
  });
}

// 🧩 5️⃣ Xóa truyện
export async function deleteNovel(id) {
  const docRef = doc(db, "novels", id);
  await deleteDoc(docRef);
}
