import type { ProductFilters as APIProductFilters } from "@/services/productsApi";

interface ProductFiltersProps {
  filters: APIProductFilters;
  onFiltersChange: (filters: APIProductFilters) => void;
}

const ProductFilters = ({ filters, onFiltersChange }: ProductFiltersProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Khoảng giá</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Dưới 500.000đ</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">500.000đ - 1.000.000đ</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Trên 1.000.000đ</span>
          </label>
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Thương hiệu</h4>
        <div className="space-y-2">
          {["Nike", "Adidas", "Puma", "Under Armour"].map((brand) => (
            <label key={brand} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Màu sắc</h4>
        <div className="flex flex-wrap gap-2">
          {["black", "white", "red", "blue", "green"].map((color) => (
            <div
              key={color}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: color === "black" ? "#000" : color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
