import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Lấy danh sách tất cả truyện
export const fetchNovels = async () => {
  const querySnapshot = await getDocs(collection(db, "novels"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Lấy chi tiết 1 truyện
export const fetchNovelById = async (novelId) => {
  const docRef = doc(db, "novels", novelId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Không tìm thấy truyện");
  }
};

// Lấy danh sách chương theo novelId
export const fetchChapters = async (novelId) => {
  const chaptersCol = collection(db, "novels", novelId, "chapters");
  const querySnapshot = await getDocs(chaptersCol);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
