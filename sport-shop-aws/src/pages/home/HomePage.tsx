import HeroBanner from "@/components/home/HeroBanner";
import FavoriteBrands from "@/components/home/FavoriteBrands";
import ProductsByBrand from "@/components/home/ProductsByBrand";
import Container from "@/components/ui/Container";

const HomePage = () => {
  return (
    <div className="h-[400vh]">
      {/* <div className="min-h-screen"> */}
      
      <HeroBanner />

      {/* <HeroBanner /> */}
      <Container>
        <FavoriteBrands />

        <ProductsByBrand />
      </Container>

      <div className="bg-amber-200 h-full"></div>
    </div>
  );
};

export default HomePage;
