import { useNavigate } from "react-router-dom";
import "../assets/home.css";

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // xóa thông tin user (tùy bạn lưu token hay context)
    // ví dụ: localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Chào mừng đến trang Home!</h1>
        <p>Bạn đã đăng nhập thành công. Đây là trang Home cho user thường.</p>
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>
    </div>
  );
}
