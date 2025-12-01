import { ArrowBigRight } from "lucide-react";
import { useState, useEffect } from "react";

const FavoriteBrands = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const targetDate = new Date("2025-12-25T00:00:00"); // Ngày Noel
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft("Sự kiện đã bắt đầu!");
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(
          `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const brands = [
    { name: "Nike", image: "https://placehold.co/700x300" },
    { name: "Adidas", image: "https://placehold.co/700x300" },
    { name: "Puma", image: "https://placehold.co/700x300" },
    { name: "Under Armour", image: "https://placehold.co/700x300" },
  ];

  return (
    <div className="py-12 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        Thương hiệu được yêu thích nhất
      </h2>
      <p className="text-center text-lg text-red-500 mb-4">
        Thời gian còn lại: {timeLeft}
      </p>
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-2 ">
        {brands.map((brand) => (
          <div key={brand.name} className="flex relative flex-col items-center">
            <img
              src={brand.image}
              alt={brand.name}
              className=" object-contain mb-2"
            />
            {/* <p className="text-lg font-semibold">{brand.name}</p> */}
            <div className="absolute bottom-6 right-4">
              <button className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition group">
                <span className="group-hover:translate-x-1 transition-transform">
                  Mua ngay
                </span>
                <ArrowBigRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteBrands;
