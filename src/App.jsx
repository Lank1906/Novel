import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import AdminNovels from "./pages/AdminNovels";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Redirect / sang /home thay vì /login */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Login page vẫn có thể truy cập */}
      <Route path="/login" element={<Login />} />

      {/* Admin dashboard protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin/user">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ Trang quản lý truyện (chỉ admin) */}
      <Route
        path="/admin/novels"
        element={
          <ProtectedRoute requiredRole="admin/user">
            <AdminNovels />
          </ProtectedRoute>
        }
      />

      {/* Home page không cần login */}
      <Route path="/home" element={<HomePage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
