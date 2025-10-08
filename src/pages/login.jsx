import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../services/authServices";
import "../assets/login.css";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        // login
        user = await signIn(email, password);
        alert("🎉 Đăng nhập thành công!");
      } else {
        // signup
        user = await signUp(email, password);
        alert("✅ Đăng ký thành công!");
      }

      // redirect theo role
      console.log(user);
      if (user.role === "admin/user") {
        navigate("/admin"); // admin dashboard
      } else {
        navigate("/home"); // trang home user
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isLogin ? "Đăng nhập" : "Đăng ký"}</h1>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <div className="toggle-section">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Đăng ký ngay" : "Quay lại đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
