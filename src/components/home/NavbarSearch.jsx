import React, { useState } from "react";

const NavbarSearch = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">📚 NovelWeb</div>
      <form className="navbar-search" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tìm kiếm truyện..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit">Tìm</button>
      </form>
    </header>
  );
};

export default NavbarSearch;
