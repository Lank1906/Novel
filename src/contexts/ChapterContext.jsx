import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getNovelById,
  getChaptersByNovelId,
  addChapter,
  updateChapter,
  deleteChapter,
} from "../services/chapterServices";

const ChapterContext = createContext();

export const useChapter = () => useContext(ChapterContext);

export const ChapterProvider = ({ children }) => {
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cache để tránh refetch khi quay lại trang
  const [cache, setCache] = useState({}); // { novelId: { novel, chapters } }

  const fetchNovelAndChapters = async (novelId, force = false) => {
    if (!novelId) return;
    if (!force && cache[novelId]) {
      const { novel, chapters } = cache[novelId];
      setNovel(novel);
      setChapters(chapters);
      return;
    }
    setLoading(true);
    try {
      const novelData = await getNovelById(novelId);
      const chapterData = await getChaptersByNovelId(novelId);
      setNovel(novelData);
      setChapters(chapterData);
      setCache((prev) => ({
        ...prev,
        [novelId]: { novel: novelData, chapters: chapterData },
      }));
    } finally {
      setLoading(false);
    }
  };

  const addNewChapter = async (novelId, novelType, chapter) => {
    let data = {};
    if (novelType === "comic") {
      const list = chapter.content
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x);
      if (!list.length) throw new Error("Nhập ít nhất 1 link ảnh!");
      data = { title: chapter.title, images: list, content: "" };
    } else {
      if (!chapter.content.trim()) throw new Error("Nhập nội dung!");
      data = { title: chapter.title, content: chapter.content, images: [] };
    }

    await addChapter(novelId, data);
    await refreshChapters(novelId);
  };

  const updateExistingChapter = async (novelId, novelType, chapter) => {
    let updatedData = { title: chapter.title };
    if (novelType === "comic") {
      const list = chapter.imagesText
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x);
      updatedData.images = list;
      updatedData.content = "";
    } else {
      updatedData.content = chapter.content;
      updatedData.images = [];
    }

    await updateChapter(novelId, chapter.id, updatedData);
    await refreshChapters(novelId);
  };

  const refreshChapters = async (novelId) => {
    const updated = await getChaptersByNovelId(novelId);
    setChapters(updated);
    setCache((prev) => ({
      ...prev,
      [novelId]: { ...(prev[novelId] || {}), chapters: updated },
    }));
  };

  const deleteExistingChapter = async (novelId, id) => {
    await deleteChapter(novelId, id);
    await refreshChapters(novelId);
    setSelected((s) => (s?.id === id ? null : s));
  };

  return (
    <ChapterContext.Provider
      value={{
        novel,
        chapters,
        selected,
        setSelected,
        fetchNovelAndChapters,
        addNewChapter,
        updateExistingChapter,
        deleteExistingChapter,
        loading,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};
