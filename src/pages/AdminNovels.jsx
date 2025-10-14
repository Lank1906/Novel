import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/adminNovels.css";
import useDebounce from "../hooks/useDebounce";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AdminLayout from "../layouts/AdminLayout";
import { useNovels } from "../contexts/NovelContext";

export default function AdminNovels() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const {
    novels,
    isLoading,
    hasMore,
    fetchNovels,
    addNovel,
    updateNovel,
    deleteNovel,
  } = useNovels();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    coverUrl: "",
    description: "",
    genres: "",
    type: "",
  });

  // Check quyền admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const data = userSnap.exists() ? userSnap.data() : null;
        const adminFlag = data?.role === "admin/user";
        if (!adminFlag) {
          navigate("/");
          return;
        }
        setIsAdmin(true);
      } catch {
        navigate("/");
      } finally {
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch novels chỉ khi xác thực xong & là admin
  useEffect(() => {
    if (loadingAuth) return; // ⏳ chờ kiểm tra quyền xong
    if (!isAdmin) return; // ❌ không phải admin thì không fetch

    // ✅ admin thật thì mới fetch
    fetchNovels(debouncedSearch, debouncedSearch.trim() !== "");
  }, [loadingAuth, isAdmin, debouncedSearch]); // eslint-disable-line

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    fetchNovels(debouncedSearch, false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: "",
      author: "",
      coverUrl: "",
      description: "",
      genres: "",
      type: "",
    });
    setShowForm(true);
  };

  const openEdit = (novel) => {
    setEditing(novel);
    setForm({
      title: novel.title || "",
      author: novel.author || "",
      coverUrl: novel.coverUrl || "",
      description: novel.description || "",
      genres: (novel.genres || []).join(", "),
      type: novel.type || "",
    });
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Nhập tiêu đề");
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      coverUrl: form.coverUrl.trim(),
      description: form.description.trim(),
      genres: form.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      type: form.type.trim(),
      titleLower: form.title.trim().toLowerCase(),
      createdAt: new Date(),
    };
    try {
      if (editing) {
        await updateNovel(editing.id, payload);
      } else {
        await addNovel(payload);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu truyện!");
    }
  };

  const handleDelete = async (novel) => {
    if (!confirm(`Xóa truyện "${novel.title}"?`)) return;
    try {
      await deleteNovel(novel.id);
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại!");
    }
  };

  if (loadingAuth || isAdmin === null)
    return <div className="admin-page">Đang kiểm tra quyền...</div>;

  if (!isAdmin)
    return (
      <div className="admin-page">Bạn không có quyền truy cập trang này.</div>
    );

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Admin — Quản lý truyện</h1>
          <div className="admin-controls">
            <input
              className="search-input"
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn primary" onClick={openAdd}>
              Thêm truyện
            </button>
          </div>
        </header>

        <main className="admin-main">
          <div className="novel-grid">
            {novels.length === 0 && !isLoading && (
              <div className="empty">Không có truyện nào</div>
            )}
            {novels.map((n) => (
              <div key={n.id} className="novel-card">
                <img
                  className="cover"
                  src={n.coverUrl || "/placeholder-cover.png"}
                  alt={n.title}
                />
                <div className="novel-body">
                  <h3 className="novel-title">{n.title}</h3>
                  <p className="novel-meta">
                    <span>{n.author || "Unknown"}</span> •{" "}
                    <span>{(n.genres || []).join(", ")}</span>
                  </p>
                  <p className="novel-desc">
                    {n.description?.slice(0, 120) || "..."}
                  </p>
                  <div className="card-actions">
                    <button
                      className="btn"
                      onClick={() => navigate(`/admin/novels/${n.id}/chapters`)}
                    >
                      Quản lý chương
                    </button>
                    <button className="btn" onClick={() => openEdit(n)}>
                      Sửa
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleDelete(n)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="load-more">
            {hasMore ? (
              <button className="btn" onClick={loadMore} disabled={isLoading}>
                {isLoading ? "Đang tải..." : "Tải thêm"}
              </button>
            ) : (
              <div className="no-more">Hết truyện</div>
            )}
          </div>
        </main>

        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editing ? "Sửa truyện" : "Thêm truyện"}</h2>
              <form onSubmit={submitForm} className="form">
                <label>
                  Tiêu đề
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </label>
                <label>
                  Tác giả
                  <input
                    value={form.author}
                    onChange={(e) =>
                      setForm({ ...form, author: e.target.value })
                    }
                  />
                </label>
                <label>
                  Cover URL
                  <input
                    value={form.coverUrl}
                    onChange={(e) =>
                      setForm({ ...form, coverUrl: e.target.value })
                    }
                  />
                </label>
                <label>
                  Thể loại (csv)
                  <input
                    value={form.genres}
                    onChange={(e) =>
                      setForm({ ...form, genres: e.target.value })
                    }
                  />
                </label>
                <label>
                  Loại
                  <input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </label>
                <label>
                  Mô tả
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowForm(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang lưu..." : editing ? "Lưu" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
