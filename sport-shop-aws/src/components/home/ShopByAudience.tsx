import { useQuery } from "@tanstack/react-query";
import { audienceApi } from "@/services/audienceApi";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";

const ShopByAudience = () => {
  const { data: audienceData, isLoading } = useQuery({
    queryKey: ["audiences"],
    queryFn: audienceApi.getAll,
  });

  const audiences = audienceData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Audience colors - phân biệt từng đối tượng
  const audienceStyles: {
    [key: string]: { bg: string; text: string; emoji: string };
  } = {
    nam: {
      bg: "from-blue-500 to-blue-700",
      text: "Nam Giới",
      emoji: "👨",
    },
    nu: {
      bg: "from-pink-500 to-pink-700",
      text: "Nữ Giới",
      emoji: "👩",
    },
    "tre-em": {
      bg: "from-yellow-400 to-orange-500",
      text: "Trẻ Em",
      emoji: "👶",
    },
    unisex: {
      bg: "from-purple-500 to-indigo-600",
      text: "Unisex",
      emoji: "👥",
    },
  };

  return (
    <div className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Mua Sắm Theo Đối Tượng</h2>
        <p className="text-gray-600">Sản phẩm dành riêng cho từng đối tượng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {audiences.map((audience) => {
          const style =
            audienceStyles[audience.slug] || audienceStyles["unisex"];
          return (
            <Link
              key={audience.id}
              to={`/collections?gender=${audience.slug}`}
              className="group"
            >
              <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {style.emoji}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {audience.name}
                  </h3>
                  <div className="w-16 h-1 bg-white/50 group-hover:w-24 transition-all duration-300" />
                  <p className="text-white/90 text-sm">Khám phá ngay →</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ShopByAudience;
