import { CategoryService } from "./CategoryService.js";
import { BrandService } from "./BrandService.js";
import { SportService } from "./SportService.js";

export class NavigationService {
  static async getMainNavigation() {
    // 1. Fetch Data Parallel
    const [
      menCategories,
      womenCategories,
      kidsCategories,
      accessoriesCategory,
      brands,
      sports,
    ] = await Promise.all([
      CategoryService.getCategoryByAudienceSlug("nam"),
      CategoryService.getCategoryByAudienceSlug("nu"),
      CategoryService.getCategoryByAudienceSlug("tre-em"),
      CategoryService.getCategoryById(22), // ID 22 là Phụ Kiện
      BrandService.getBrandNames(),
      SportService.getSportNames(),
    ]);

    // Helper to map Category Tree to Nav Item
    const mapCategoryToNav = (category: any): any => {
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        items: category.children?.map(mapCategoryToNav) || [],
      };
    };

    // 2. Construct Response
    const navigation = [
      {
        id: "nav-men",
        name: "Nam",
        slug: "nam",
        children: menCategories.map(mapCategoryToNav),
      },
      {
        id: "nav-women",
        name: "Nữ",
        slug: "nu",
        children: womenCategories.map(mapCategoryToNav),
      },
      {
        id: "nav-kids",
        name: "Trẻ em",
        slug: "tre-em",
        children: kidsCategories.map(mapCategoryToNav),
      },
      {
        id: "nav-accessories",
        name: "Phụ Kiện",
        slug: "phu-kien",
        children: accessoriesCategory?.children?.map(mapCategoryToNav) || [],
      },
      {
        id: "STATIC_BRAND",
        name: "Thương Hiệu",
        slug: "thuong-hieu",
        children: [
          {
            id: "brands-column",
            name: "CÁC THƯƠNG HIỆU",
            items: brands,
          },
        ],
      },
      {
        id: "STATIC_SPORT",
        name: "Thể Thao",
        slug: "the-thao",
        children: [
          {
            id: "sports-column",
            name: "MÔN THỂ THAO",
            items: sports,
          },
        ],
      },
    ];

    return navigation;
  }
}
