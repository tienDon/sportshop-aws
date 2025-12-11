import HeroBanner from "@/components/home/HeroBanner";
import FavoriteBrands from "@/components/home/FavoriteBrands";
import ProductsByBrand from "@/components/home/ProductsByBrand";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ShopBySport from "@/components/home/ShopBySport";
import ShopByAudience from "@/components/home/ShopByAudience";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import Container from "@/components/ui/Container";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroBanner />

      <Container>
        {/* Promo Banner và Features */}
        <PromoBanner />

        {/* Thương hiệu yêu thích */}
        <FavoriteBrands />

        {/* Sản phẩm mới nhất */}
        {/* <NewArrivals /> */}

        {/* Mua sắm theo đối tượng */}
        {/* <ShopByAudience /> */}

        {/* Sản phẩm theo thương hiệu */}
        <ProductsByBrand />

        {/* Danh mục sản phẩm */}
        {/* <FeaturedCategories /> */}

        {/* Mua sắm theo môn thể thao */}
        {/* <ShopBySport /> */}
      </Container>

      <Footer />
    </div>
  );
};

export default HomePage;
