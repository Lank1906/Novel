import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">Trang bạn tìm không tồn tại.</p>
      <Link to="/" className="text-indigo-400 hover:underline">
        Quay lại trang chủ
      </Link>
    </div>
  );
}
