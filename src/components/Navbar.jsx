import { logout } from "../services/authServices";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div>
        <h1>📚 Admin Panel</h1>
        {user && <span className="user-info">Xin chào, {user.email}</span>}
      </div>
      <button onClick={handleLogout}>Đăng xuất</button>
    </nav>
  );
}
