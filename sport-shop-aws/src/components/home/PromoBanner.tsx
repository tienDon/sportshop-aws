import { Link } from "react-router";
import { ShoppingBag, Truck, RotateCcw, Shield } from "lucide-react";

const PromoBanner = () => {
  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Sản Phẩm Chính Hãng",
      description: "100% sản phẩm từ thương hiệu uy tín",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Miễn Phí Vận Chuyển",
      description: "Đơn hàng từ 500.000đ",
    },
    {
      icon: <RotateCcw className="w-8 h-8" />,
      title: "Đổi Trả 30 Ngày",
      description: "Dễ dàng đổi trả trong 30 ngày",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bảo Hành Chính Hãng",
      description: "Bảo hành theo tiêu chuẩn nhà sản xuất",
    },
  ];

  return (
    <div className="py-12">
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-red-600 mb-4">{feature.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Promo Banner */}
      {/* <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-12 text-white"> */}
      {/* <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Giảm Giá Lên Đến 50%</h2>
          <p className="text-xl mb-6 text-white/90">
            Mùa Sale lớn nhất năm - Đừng bỏ lỡ cơ hội sở hữu sản phẩm yêu thích
            với giá tốt nhất
          </p>
          <Link
            to="/collections"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Mua Ngay
          </Link>
        </div> */}

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      {/* </div> */}
    </div>
  );
};

export default PromoBanner;
