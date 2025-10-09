import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { subscribeAuth } from "../services/authServices";
import "../assets/dashboard.css";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = subscribeAuth((u) => setUser(u));
    return unsub;
  }, []);

  if (!user)
    return (
      <p className="dashboard-content">Đang tải thông tin người dùng...</p>
    );

  return (
    <div className="dashboard-container">
      <Navbar user={user} />

      <div className="dashboard-content">
        <h1>Bảng điều khiển Admin</h1>
        <p>Chào mừng, {user.email}!</p>
        <p>Vai trò của bạn: {user.role}</p>

        {/* Ví dụ thêm các card */}
        <div className="dashboard-card">
          <h2>Thống kê người dùng</h2>
          <p>Hiện tại có 120 người dùng đăng ký.</p>
        </div>

        <div className="dashboard-card">
          <h2>Thông báo hệ thống</h2>
          <p>Tất cả hệ thống hoạt động ổn định.</p>
        </div>
      </div>
    </div>
  );
}
