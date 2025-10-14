import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChapter } from "../contexts/ChapterContext";
import "../assets/adminChapters.css";

export default function AdminChapters() {
  const { novelId } = useParams();
  const {
    novel,
    chapters,
    selected,
    setSelected,
    fetchNovelAndChapters,
    addNewChapter,
    updateExistingChapter,
    deleteExistingChapter,
    loading,
  } = useChapter();

  const [newChapter, setNewChapter] = useState({ title: "", content: "" });
  const [editMode, setEditMode] = useState(false);
  const [editChapter, setEditChapter] = useState({
    id: "",
    title: "",
    content: "",
    imagesText: "",
  });

  useEffect(() => {
    fetchNovelAndChapters(novelId);
  }, [novelId]);

  if (loading || !novel) return <p className="loading">Đang tải dữ liệu...</p>;

  const handleAdd = async () => {
    try {
      await addNewChapter(novelId, novel.type, newChapter);
      setNewChapter({ title: "", content: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (chapter) => {
    setEditMode(true);
    setEditChapter({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content || "",
      imagesText: (chapter.images || []).join("\n"),
    });
  };

  const handleUpdate = async () => {
    try {
      await updateExistingChapter(novelId, novel.type, editChapter);
      setEditMode(false);
      setEditChapter({ id: "", title: "", content: "", imagesText: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa chapter này?")) {
      await deleteExistingChapter(novelId, id);
    }
  };

  const formatDate = (ts) =>
    ts?.seconds ? new Date(ts.seconds * 1000).toLocaleString("vi-VN") : "—";

  return (
    <div className="chapter-container">
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

          {/* Form sửa */}
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
