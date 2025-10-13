import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getNovelById,
  getChaptersByNovelId,
  addChapter,
  updateChapter,
  deleteChapter,
} from "../services/chapterServices";
import "../assets/adminChapters.css";

export default function AdminChapters() {
  const { novelId } = useParams();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selected, setSelected] = useState(null);

  const [newChapter, setNewChapter] = useState({
    title: "",
    content: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [editChapter, setEditChapter] = useState({
    id: "",
    title: "",
    content: "",
    images: [],
    imagesText: "",
  });

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      const novelData = await getNovelById(novelId);
      setNovel(novelData);
      const chapterData = await getChaptersByNovelId(novelId);
      setChapters(chapterData);
    };
    fetchData();
  }, [novelId]);

  // ➕ Thêm chapter
  const handleAdd = async () => {
    if (!newChapter.title.trim()) return alert("Nhập tiêu đề chapter!");
    let data = {};

    if (novel.type === "comic") {
      const list = newChapter.content
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x);
      if (list.length === 0) return alert("Nhập ít nhất 1 link ảnh!");
      data = { title: newChapter.title, images: list, content: "" };
    } else {
      if (!newChapter.content.trim()) return alert("Nhập nội dung!");
      data = {
        title: newChapter.title,
        content: newChapter.content,
        images: [],
      };
    }

    await addChapter(novelId, data);
    const updated = await getChaptersByNovelId(novelId);
    setChapters(updated);
    setNewChapter({ title: "", content: "" });
  };

  // ✏️ Mở form sửa
  const handleEdit = (chapter) => {
    setEditMode(true);
    setEditChapter({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content || "",
      images: chapter.images || [],
      imagesText: (chapter.images || []).join("\n"),
    });
  };

  // 💾 Lưu thay đổi
  const handleUpdate = async () => {
    if (!editChapter.title.trim()) return alert("Nhập tiêu đề!");

    let updatedData = { title: editChapter.title };

    if (novel.type === "comic") {
      const list = editChapter.imagesText
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x);
      updatedData.images = list;
      updatedData.content = "";
    } else {
      updatedData.content = editChapter.content;
      updatedData.images = [];
    }

    await updateChapter(novelId, editChapter.id, updatedData);
    const updated = await getChaptersByNovelId(novelId);
    setChapters(updated);
    setEditMode(false);
    setEditChapter({
      id: "",
      title: "",
      content: "",
      images: [],
      imagesText: "",
    });
  };

  // 🗑️ Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Xóa chapter này?")) {
      await deleteChapter(novelId, id);
      const updated = await getChaptersByNovelId(novelId);
      setChapters(updated);
      if (selected?.id === id) setSelected(null);
    }
  };

  // Format Firestore timestamp
  const formatDate = (ts) => {
    if (!ts) return "Chưa có";
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString("vi-VN");
    return ts;
  };

  if (!novel) return <p className="loading">Đang tải dữ liệu...</p>;

  return (
    <div className="chapter-container">
      {/* Cột trái: Thông tin truyện */}
      <div className="novel-info">
        {novel.cover && (
          <img src={novel.cover} alt={novel.title} className="novel-cover" />
        )}
        <h2>{novel.title}</h2>
        <p>
          <strong>Tác giả:</strong> {novel.author}
        </p>
        <p>
          <strong>Loại:</strong>{" "}
          {novel.type === "comic" ? "Truyện tranh" : "Tiểu thuyết"}
        </p>
        <p>
          <strong>Ngày tạo:</strong> {formatDate(novel.createdAt)}
        </p>
        {novel.description && <p className="novel-desc">{novel.description}</p>}
      </div>

      {/* Cột phải */}
      <div className="chapter-panel">
        <div className="chapter-list">
          <h3>Danh sách Chapter</h3>
          <div className="list-content">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                className={`chapter-item ${
                  selected?.id === ch.id ? "active" : ""
                }`}
              >
                <div onClick={() => setSelected(ch)} className="chapter-title">
                  {ch.title}
                </div>
                <div className="chapter-actions">
                  <button onClick={() => handleEdit(ch)}>Sửa</button>
                  <button onClick={() => handleDelete(ch.id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>

          {/* Thêm mới */}
          <div className="add-section">
            <h4>Thêm Chapter mới</h4>
            <input
              type="text"
              placeholder="Tiêu đề"
              value={newChapter.title}
              onChange={(e) =>
                setNewChapter({ ...newChapter, title: e.target.value })
              }
            />
            <textarea
              placeholder={
                novel.type === "comic"
                  ? "Dán mỗi link ảnh một dòng..."
                  : "Nhập nội dung chương..."
              }
              value={newChapter.content}
              onChange={(e) =>
                setNewChapter({ ...newChapter, content: e.target.value })
              }
            />
            <button onClick={handleAdd}>Thêm</button>
          </div>

          {/* Sửa */}
          {editMode && (
            <div className="edit-section">
              <h4>Chỉnh sửa Chapter</h4>
              <input
                type="text"
                value={editChapter.title}
                onChange={(e) =>
                  setEditChapter({ ...editChapter, title: e.target.value })
                }
              />
              <textarea
                placeholder={
                  novel.type === "comic"
                    ? "Mỗi link ảnh 1 dòng..."
                    : "Nội dung chương..."
                }
                value={
                  novel.type === "comic"
                    ? editChapter.imagesText
                    : editChapter.content
                }
                onChange={(e) =>
                  novel.type === "comic"
                    ? setEditChapter({
                        ...editChapter,
                        imagesText: e.target.value,
                      })
                    : setEditChapter({
                        ...editChapter,
                        content: e.target.value,
                      })
                }
              />
              <div className="edit-buttons">
                <button onClick={handleUpdate}>Lưu</button>
                <button onClick={() => setEditMode(false)}>Hủy</button>
              </div>
            </div>
          )}
        </div>

        {/* Xem chi tiết */}
        <div className="chapter-detail">
          {selected ? (
            <>
              <h3>{selected.title}</h3>
              {novel.type === "comic" ? (
                <div className="image-preview">
                  {selected.images?.map((img, i) => (
                    <img key={i} src={img} alt={`img-${i}`} />
                  ))}
                </div>
              ) : (
                <p>{selected.content}</p>
              )}
              <p className="created-at">
                Ngày tạo: {formatDate(selected.createdAt)}
              </p>
            </>
          ) : (
            <div className="placeholder">Chọn một chapter để xem chi tiết</div>
          )}
        </div>
      </div>
    </div>
  );
}
