import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { subscribeAuth } from "../services/authServices";

export default function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading)
    return <div className="text-center text-white p-10">Đang tải...</div>;

  if (!user) return <Navigate to="/login" replace />;
  console.log(user);
  // Nếu có role yêu cầu và không khớp → chặn truy cập
  if (requiredRole && user.role != requiredRole)
    return <Navigate to="/login" replace />;

  return children;
}
