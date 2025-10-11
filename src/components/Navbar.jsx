import { logout } from "../services/authServices";
import { useNavigate, Link } from "react-router-dom";
import "../assets/navbar.css";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">📚 Admin Panel</h1>
        <ul className="nav-links">
          <li>
            <Link to="/home">Trang chủ</Link>
          </li>
          <li>
            <Link to="/admin/novels">Quản lý truyện</Link>
          </li>
          <li>
            <Link to="/admin/chapters">Quản lý chương</Link>
          </li>
        </ul>
      </div>

      <div className="nav-right">
        {user && <span className="user-info">Xin chào, {user.email}</span>}
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>
    </nav>
  );
}
