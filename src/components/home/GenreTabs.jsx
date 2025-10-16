import React from "react";

const genres = [
  "Tất cả",
  "Hành động",
  "Tình cảm",
  "Hài hước",
  "Kinh dị",
  "Phiêu lưu",
];

const GenreTabs = ({ selected, onSelect }) => {
  return (
    <div className="genre-tabs">
      {genres.map((g) => (
        <button
          key={g}
          className={`genre-btn ${selected === g ? "active" : ""}`}
          onClick={() => onSelect(g)}
        >
          {g}
        </button>
      ))}
    </div>
  );
};

export default GenreTabs;
