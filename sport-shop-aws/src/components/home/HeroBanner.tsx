import React from "react";

const HeroBanner = () => {
  return (
    <div className="relative mt-5 bg-gray-100 h-[80vh] flex items-center justify-center">
      <img
        src="https://cdn.shopify.com/s/files/1/0456/5070/6581/files/LP_12.12_KV_DESK_NEW_VN.jpg?v=1765186097&width=1440"
        alt="Hero Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default HeroBanner;
