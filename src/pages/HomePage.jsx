import React, { useState, useEffect } from "react";
import NavbarSearch from "../components/home/NavbarSearch";
import GenreTabs from "../components/home/GenreTabs";
import HighlightSection from "../components/home/HighlightSection";
import LatestChaptersSection from "../components/home/LatestChaptersSection";
import TopDailyChaptersSection from "../components/home/TopDailyChaptersSection";
import NovelListSection from "../components/home/NovelListSection";
import AdsBanner from "../components/home/AdsBanner";
import "../assets/home.css";

const Home = () => {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Tất cả");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-container">
      <NavbarSearch onSearch={setSearch} />
      <GenreTabs selected={genre} onSelect={setGenre} />

      <div className="home-content">
        <HighlightSection />
        <LatestChaptersSection />
        <TopDailyChaptersSection />
        <NovelListSection search={search} genre={genre} />
      </div>

      <AdsBanner position="bottom" />
    </div>
  );
};

export default Home;
