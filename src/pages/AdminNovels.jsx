import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/adminNovels.css";
import useDebounce from "../hooks/useDebounce";
import {
  getNovels,
  addNovel as svcAddNovel,
  updateNovel as svcUpdateNovel,
  deleteNovel as svcDeleteNovel,
} from "../services/novelService";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AdminLayout from "../layouts/AdminLayout";
/**
 * AdminNovels
 * - Search + Debounce
 * - Pagination (Load more)
 * - Caching via sessionStorage
 * - Prefetch next page when "Load more" shown
 * - Permission check (user doc in 'users' with role === 'admin' or isAdmin true)
 *
 * Usage: Route protected => <AdminNovels />
 */

const PAGE_SIZE = 12;
const CACHE_PREFIX = "admin_novels_cache_v1";

export default function AdminNovels() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null); // null = checking, false = no, true = yes
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Data
  const [novels, setNovels] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, {id,...} = edit
  const [form, setForm] = useState({
    title: "",
    author: "",
    coverUrl: "",
    description: "",
    genres: "",
    type: "",
  });

  const lastFetchRef = useRef(null); // cache last query to avoid duplicate fetches

  // Auth + permission check
  useEffect(() => {
    setLoadingAuth(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // not logged in -> redirect to home or login
        setIsAdmin(false);
        setLoadingAuth(false);
        navigate("/login");
        return;
      }
      try {
        // read user doc from 'users'
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const data = userSnap.exists() ? userSnap.data() : null;
        const adminFlag = data?.role === "admin/user";
        if (!adminFlag) {
          setIsAdmin(false);
          setLoadingAuth(false);
          navigate("/"); // not admin -> go to home
          return;
        }
        setIsAdmin(true);
        setLoadingAuth(false);
      } catch (err) {
        console.error("Error checking admin:", err);
        setIsAdmin(false);
        setLoadingAuth(false);
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Build cache key
  const cacheKey = (searchTerm, lastId) =>
    `${CACHE_PREFIX}_${searchTerm || "all"}_${lastId || "first"}`;

  // Fetch novels (refresh===true -> reset list)
  const fetchNovels = useCallback(
    async (refresh = false) => {
      // Avoid fetching while auth check ongoing
      if (loadingAuth) return;
      setLoading(true);

      try {
        const wantSearch = debouncedSearch?.trim() || "";
        const lastDocForRequest = refresh ? null : lastVisible;

        // prevent duplicate identical requests
        const lastKey = cacheKey(wantSearch, lastDocForRequest?.id);
        if (!refresh && lastFetchRef.current === lastKey) {
          setLoading(false);
          return;
        }
        lastFetchRef.current = lastKey;

        // Try sessionStorage cache first
        const cached = sessionStorage.getItem(
          cacheKey(wantSearch, lastDocForRequest?.id)
        );
        if (cached && refresh === false) {
          const parsed = JSON.parse(cached);
          setNovels((prev) =>
            refresh ? parsed.novels : [...prev, ...parsed.novels]
          );
          setLastVisible(parsed.lastVisible || null);
          setHasMore(Boolean(parsed.lastVisible));
          setLoading(false);
          // Prefetch next page asynchronously
          prefetchNext(parsed.lastVisible, wantSearch);
          return;
        }

        // Call service
        const res = await getNovels({
          pageSize: PAGE_SIZE,
          lastDoc: lastDocForRequest,
          searchTerm: wantSearch,
          forceRefresh: refresh,
        });

        // update state: if refresh -> replace; else append
        setNovels((prev) => (refresh ? res.novels : [...prev, ...res.novels]));
        setLastVisible(res.lastVisible || null);
        setHasMore(Boolean(res.lastVisible));

        // Cache result
        sessionStorage.setItem(
          cacheKey(wantSearch, lastDocForRequest?.id),
          JSON.stringify(res)
        );

        // Prefetch next page
        prefetchNext(res.lastVisible, wantSearch);
      } catch (err) {
        console.error("Fetch novels error:", err);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, lastVisible, loadingAuth]
  );

  // Prefetch next page (non-blocking)
  const prefetchNext = async (lastDocForPrefetch, searchTerm) => {
    if (!lastDocForPrefetch) return;
    const nextKey = cacheKey(searchTerm, lastDocForPrefetch.id || "next");
    // if already cached, skip
    if (sessionStorage.getItem(nextKey)) return;
    try {
      const res = await getNovels({
        pageSize: PAGE_SIZE,
        lastDoc: lastDocForPrefetch,
        searchTerm,
        forceRefresh: false,
      });
      sessionStorage.setItem(nextKey, JSON.stringify(res));
    } catch (err) {
      // ignore prefetch errors
    }
  };

  // Initial fetch & on search change
  useEffect(() => {
    // refresh whenever debounced search changes
    setLastVisible(null);
    fetchNovels(true);
  }, [debouncedSearch]); // eslint-disable-line

  // Load more handler
  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchNovels(false);
  };

  // Open add form
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

  // Open edit form
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

  // Submit add/edit
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
    setLoading(true);
    try {
      if (editing) {
        await svcUpdateNovel(editing.id, payload);
        // update local state
        setNovels((prev) =>
          prev.map((n) => (n.id === editing.id ? { ...n, ...payload } : n))
        );
      } else {
        const newId = await svcAddNovel(payload);
        const newItem = { id: newId, ...payload };
        setNovels((prev) => [newItem, ...prev]);
      }
      // clear caches that might be stale
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => sessionStorage.removeItem(k));
      setShowForm(false);
    } catch (err) {
      console.error("Save novel error:", err);
      alert("Lỗi lưu truyện. Kiểm tra console.");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (novel) => {
    if (!confirm(`Bạn có chắc muốn xóa truyện "${novel.title}" ?`)) return;
    setLoading(true);
    try {
      await svcDeleteNovel(novel.id);
      setNovels((prev) => prev.filter((n) => n.id !== novel.id));
      // clear caches
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch (err) {
      console.error("Delete novel error:", err);
      alert("Xóa thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth || isAdmin === null) {
    return <div className="admin-page">Đang kiểm tra quyền...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">Bạn không có quyền truy cập trang này.</div>
    );
  }

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
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <button className="btn primary" onClick={openAdd}>
              Thêm truyện
            </button>
          </div>
        </header>

        <main className="admin-main">
          <div className="novel-grid">
            {novels.length === 0 && !loading && (
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
              <button className="btn" onClick={loadMore} disabled={loading}>
                {loading ? "Đang tải..." : "Tải thêm"}
              </button>
            ) : (
              <div className="no-more">Hết truyện</div>
            )}
          </div>
        </main>

        {/* Form modal */}
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
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : editing ? "Lưu" : "Thêm"}
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
