import { useQuery } from "@tanstack/react-query";
import { sportApi } from "@/services/sportApi";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";

const ShopBySport = () => {
  const { data: sportData, isLoading } = useQuery({
    queryKey: ["sports"],
    queryFn: sportApi.getAll,
  });

  const sports = sportData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Sport icons mapping - có thể thay bằng icon thực tế
  const sportIcons: { [key: string]: string } = {
    "bong-da": "⚽",
    "bong-ro": "🏀",
    tennis: "🎾",
    "cau-long": "🏸",
    "chay-bo": "🏃",
    "boi-loi": "🏊",
    yoga: "🧘",
    gym: "💪",
  };

  return (
    <div className="py-12 bg-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Mua Sắm Theo Môn Thể Thao</h2>
        <p className="text-gray-600">
          Tìm sản phẩm phù hợp cho môn thể thao yêu thích của bạn
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sports
          .filter((sport) => sport.isActive)
          .slice(0, 12)
          .map((sport) => (
            <Link
              key={sport.id}
              to={`/collections?sport=${sport.slug}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="text-5xl group-hover:scale-125 transition-transform duration-300">
                    {sportIcons[sport.slug] || "🏃"}
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {sport.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ShopBySport;
