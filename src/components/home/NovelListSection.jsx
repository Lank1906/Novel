import React, { useState } from "react";

const NovelListSection = ({ search, genre }) => {
  const [page, setPage] = useState(1);

  const novels = [
    { id: 1, title: "Truyện Alpha" },
    { id: 2, title: "Truyện Beta" },
  ];

  return (
    <section className="novel-list">
      <h2>Danh sách truyện {genre !== "Tất cả" ? `- ${genre}` : ""}</h2>
      <div className="novel-grid">
        {novels.map((n) => (
          <div key={n.id} className="novel-card">
            <div className="novel-cover">Ảnh</div>
            <div className="novel-info">
              <h3>{n.title}</h3>
              <button>Đọc ngay</button>
            </div>
          </div>
        ))}
      </div>
      <button className="load-more">Xem thêm</button>
    </section>
  );
};

export default NovelListSection;
