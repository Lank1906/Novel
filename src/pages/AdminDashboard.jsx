import AdminLayout from "../layouts/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1>Bảng điều khiển Admin</h1>
      <p>Chào mừng đến trang quản trị!</p>

      <div className="dashboard-card">
        <h2>Thống kê người dùng</h2>
        <p>Hiện tại có 120 người dùng đăng ký.</p>
      </div>

      <div className="dashboard-card">
        <h2>Thông báo hệ thống</h2>
        <p>Tất cả hệ thống hoạt động ổn định.</p>
      </div>
    </AdminLayout>
  );
}
