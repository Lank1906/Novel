import { useEffect, useState } from "react";
import { subscribeAuth } from "../services/authServices";
import Navbar from "../components/Navbar";
import "../assets/dashboard.css";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = subscribeAuth((u) => setUser(u));
    return unsub;
  }, []);

  if (!user)
    return (
      <div className="dashboard-content">Đang tải thông tin người dùng...</div>
    );

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      <div className="dashboard-content">{children}</div>
    </div>
  );
}
