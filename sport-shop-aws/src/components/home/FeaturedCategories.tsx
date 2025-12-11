import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/services/categoryApi";
import { Link } from "react-router";
import { Loader2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const FeaturedCategories = () => {
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getTree,
  });

  const categories = categoryData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Lấy danh mục cha (parent categories)
  const parentCategories = categories.filter((cat) => !cat.parentId);

  return (
    <div className="py-12 bg-gray-50">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Danh Mục Sản Phẩm</h2>
        <p className="text-gray-600">Khám phá các sản phẩm theo danh mục</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {parentCategories.slice(0, 8).map((category) => (
          <Link
            key={category.id}
            to={`/collections?category=${category.slug}`}
            className="group"
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform">
                  {category.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.children && category.children.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {category.children.length} danh mục con
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          Xem tất cả danh mục
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default FeaturedCategories;
