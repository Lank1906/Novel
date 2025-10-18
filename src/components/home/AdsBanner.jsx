import React from "react";

const AdsBanner = ({ position }) => {
  return (
    <div className={`ads-banner ads-${position}`}>
      <p>Vị trí quảng cáo ({position})</p>
    </div>
  );
};

export default AdsBanner;
